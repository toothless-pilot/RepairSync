import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CONVEX_URL = "https://adorable-hawk-821.convex.cloud";

async function convexMutation(path: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Convex mutation ${path} failed (${res.status}): ${errText}`);
  }
  const json = await res.json();
  return json.value;
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is required to photograph vehicle damage.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || uploading) return;
    setUploading(true);

    try {
      // 1. Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
      });
      console.log("[capture] photo result:", photo);

      if (!photo?.uri) throw new Error("Failed to capture photo — no URI returned");

      // 2. Create assessment record in Convex
      console.log("[convex] creating assessment...");
      const assessmentId = await convexMutation("assessments:createAssessment", {});
      console.log("[convex] assessment created:", assessmentId);

      // 3. Get a signed Convex storage upload URL
      console.log("[convex] generating upload URL...");
      const uploadUrl = await convexMutation("assessments:generateUploadUrl", {});
      console.log("[convex] upload URL:", uploadUrl);

      // 4. Read the captured photo as a blob
      console.log("[upload] fetching photo blob from:", photo.uri);
      const photoResponse = await fetch(photo.uri);
      const blob = await photoResponse.blob();
      console.log("[upload] blob size:", blob.size, "type:", blob.type);

      // 5. PUT the blob directly to Convex storage
      console.log("[upload] PUT to Convex storage...");
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      console.log("[upload] response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        console.error("[upload] error body:", errText);
        throw new Error(`Storage upload failed (${uploadResponse.status}): ${errText}`);
      }

      const { storageId } = await uploadResponse.json();
      console.log("[upload] storageId:", storageId);

      if (!storageId) throw new Error("Upload succeeded but no storageId returned");

      // 6. Resolve storageId to a public URL and save it on the assessment
      console.log("[convex] saving storageId and resolving URL...");
      const imageUrl = await convexMutation("assessments:saveStorageId", {
        id: assessmentId,
        storageId,
      });
      console.log("[convex] imageUrl saved:", imageUrl);

      // 7. Flip status to analyzing
      console.log("[convex] setting status to analyzing...");
      await convexMutation("assessments:setAnalyzing", { id: assessmentId });

      // 8. Navigate to results — subscribes reactively to Convex
      console.log("[nav] navigating to results:", assessmentId);
      router.push({ pathname: "/results", params: { id: assessmentId } });
    } catch (err: any) {
      console.error("[handleCapture] error:", err);
      Alert.alert("Error", err.message ?? "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.label}>Point at vehicle damage</Text>
          <Pressable
            style={[styles.captureButton, uploading && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#0a0a0a" size="small" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </Pressable>
          {uploading && (
            <Text style={styles.uploadingText}>Uploading...</Text>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
    gap: 16,
  },
  label: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
  },
  uploadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  permissionText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
