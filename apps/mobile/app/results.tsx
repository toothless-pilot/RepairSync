import { useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";



const SEVERITY_COLORS: Record<string, string> = {
  minor: "#16a34a",
  moderate: "#d97706",
  severe: "#dc2626",
};

function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toLowerCase();
  const color = SEVERITY_COLORS[normalized] ?? "#6b7280";
  return (
    <View style={[styles.badge, { backgroundColor: color + "33", borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{severity.toUpperCase()}</Text>
    </View>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
  return (
    <View style={styles.confidenceRow}>
      <View style={styles.confidenceTrack}>
        <View style={[styles.confidenceFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.confidenceLabel, { color }]}>{pct}%</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const assessment = useQuery(api.assessments.getAssessment, {
    id: id as Id<"assessments">,
  });

  if (assessment === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (assessment === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Assessment not found.</Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (assessment.status === "analyzing" || assessment.status === "uploading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#2563eb" size="large" style={{ marginBottom: 20 }} />
        <Text style={styles.analyzingText}>Analyzing your damage...</Text>
        <Text style={styles.analyzingSubtext}>This usually takes 10–20 seconds</Text>
      </View>
    );
  }

  if (assessment.status === "failed") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorText}>Analysis failed.</Text>
        <Text style={styles.errorSubtext}>
          The image could not be processed. Please try again with a clearer photo.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => router.replace("/")}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // status === "complete"
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/")} style={styles.backButton}>
          <Text style={styles.backText}>New Photo</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Damage Report</Text>
      </View>

      {/* Photo */}
      {assessment.imageUrl ? (
        <Image source={{ uri: assessment.imageUrl }} style={styles.photo} resizeMode="cover" />
      ) : null}

      {/* Overall card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Overall Severity</Text>
          {assessment.overallSeverity && (
            <SeverityBadge severity={assessment.overallSeverity} />
          )}
        </View>
        <View style={[styles.cardRow, { marginTop: 12 }]}>
          <Text style={styles.cardLabel}>Repair Priority</Text>
          <Text style={styles.cardValue}>{assessment.repairPriority ?? "—"}</Text>
        </View>
        {assessment.vehicleDescription && (
          <View style={[styles.cardRow, { marginTop: 12 }]}>
            <Text style={styles.cardLabel}>Vehicle</Text>
            <Text style={[styles.cardValue, { flex: 1, textAlign: "right" }]}>
              {assessment.vehicleDescription}
            </Text>
          </View>
        )}
      </View>

      {/* Summary */}
      {assessment.summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{assessment.summary}</Text>
        </View>
      )}

      {/* Damage zones */}
      {assessment.damageZones && assessment.damageZones.length > 0 && (
        <View style={styles.zonesSection}>
          <Text style={styles.sectionTitle}>Damage Zones</Text>
          {assessment.damageZones.map((zone, i) => (
            <View key={i} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <Text style={styles.zoneName}>{zone.zoneName}</Text>
                <SeverityBadge severity={zone.severity} />
              </View>
              <Text style={styles.zoneDescription}>{zone.description}</Text>
              <View style={styles.confidenceSection}>
                <Text style={styles.confidenceTitle}>Confidence</Text>
                <ConfidenceBar value={zone.confidence} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Disclaimer */}
      {assessment.disclaimer && (
        <Text style={styles.disclaimer}>{assessment.disclaimer}</Text>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0a0a0a" },
  scrollContent: { paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  analyzingText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  analyzingSubtext: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  errorIcon: {
    color: "#dc2626",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 12,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: { marginRight: "auto" },
  backText: { color: "#2563eb", fontSize: 16 },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    top: 56,
  },
  photo: {
    width: "100%",
    height: 240,
    backgroundColor: "#1a1a1a",
  },
  card: {
    margin: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLabel: { color: "#9ca3af", fontSize: 14 },
  cardValue: { color: "#ffffff", fontSize: 14, fontWeight: "500" },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  sectionTitle: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  summaryText: { color: "#e5e7eb", fontSize: 15, lineHeight: 22 },
  zonesSection: { marginHorizontal: 16 },
  zoneCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  zoneName: { color: "#ffffff", fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  zoneDescription: { color: "#9ca3af", fontSize: 14, lineHeight: 20, marginBottom: 12 },
  confidenceSection: {},
  confidenceTitle: { color: "#6b7280", fontSize: 12, marginBottom: 6 },
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  confidenceTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#2a2a2a",
    borderRadius: 2,
    overflow: "hidden",
  },
  confidenceFill: { height: 4, borderRadius: 2 },
  confidenceLabel: { fontSize: 12, fontWeight: "600", minWidth: 32 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  disclaimer: {
    color: "#4b5563",
    fontSize: 11,
    lineHeight: 16,
    marginHorizontal: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
