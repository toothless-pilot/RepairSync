"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { LineItem } from "@/lib/damage-pricing";

const INK       = "#0A0B0F";
const INK_MID   = "#111318";
const INK_LIGHT = "#1C1E27";
const LIME      = "#C6E83A";
const CREAM     = "#F7F8F2";
const MUTED     = "#7A7D8A";
const BORDER    = "rgba(247,248,242,0.08)";

const PART_NAMES: Record<string, string> = {
  "front-bumper":          "Front Bumper",
  "rear-bumper":           "Rear Bumper",
  "front-door":            "Front Door",
  "rear-door":             "Rear Door",
  "front-headlight":       "Front Headlight",
  "rear-taillight":        "Rear Taillight",
  "windshield":            "Windshield",
  "back-passenger-window": "Rear Window",
  "front-wheel":           "Front Wheel",
  "rear-wheel":            "Rear Wheel",
};

const s = StyleSheet.create({
  page:         { padding: 0, backgroundColor: INK, fontFamily: "Helvetica", fontSize: 10, color: CREAM },

  // Top lime bar
  topBar:       { height: 4, backgroundColor: LIME, width: "100%" },

  // Inner page padding
  inner:        { padding: "32 44" },

  // Header
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, paddingBottom: 24, borderBottom: `1 solid ${BORDER}` },
  logo:         { fontFamily: "Helvetica-Bold", fontWeight: 800, fontSize: 18, color: CREAM, letterSpacing: -0.5 },
  logoAccent:   { color: LIME },
  logoSub:      { fontSize: 7, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 },
  metaBlock:    { alignItems: "flex-end", gap: 6 },
  metaRow:      { alignItems: "flex-end" },
  metaLabel:    { fontSize: 6.5, color: MUTED, textTransform: "uppercase", letterSpacing: 2 },
  metaVal:      { fontFamily: "Helvetica", fontWeight: 600, fontSize: 10, color: CREAM, marginTop: 1 },

  // Sections
  section:      { marginBottom: 28 },
  eyebrow:      { fontSize: 6.5, fontFamily: "Helvetica", fontWeight: 600, color: LIME, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 12 },

  // Vehicle
  vehicleName:  { fontFamily: "Helvetica-Bold", fontWeight: 800, fontSize: 28, color: CREAM, letterSpacing: -1, lineHeight: 1 },

  // Summary
  summaryText:  { fontSize: 10, lineHeight: 1.8, color: `${CREAM}CC` },

  // Photo
  photo:        { width: "100%", borderRadius: 6, marginBottom: 6, objectFit: "cover", maxHeight: 200 },
  photoCaption: { fontSize: 7, color: MUTED, color: MUTED },

  // Damage rows
  damageCard:   { backgroundColor: INK_MID, borderRadius: 8, padding: "0 0", marginBottom: 2, overflow: "hidden" },
  damageRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "10 14" },
  damageSep:    { height: 1, backgroundColor: BORDER },
  damageLabel:  { fontFamily: "Helvetica", fontWeight: 600, fontSize: 10, color: CREAM },
  damageNote:   { fontSize: 8, color: MUTED, color: MUTED, marginTop: 2 },
  badge:        { fontSize: 7, fontFamily: "Helvetica", fontWeight: 600, padding: "3 9", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 },
  badgeMinor:   { backgroundColor: "rgba(198,232,58,0.12)", color: LIME },
  badgeMod:     { backgroundColor: "rgba(198,232,58,0.22)", color: LIME },
  badgeSev:     { backgroundColor: "rgba(198,232,58,0.36)", color: LIME },

  // Quote table
  tableWrap:    { backgroundColor: INK_MID, borderRadius: 8, overflow: "hidden" },
  tableHead:    { flexDirection: "row", padding: "9 14", borderBottom: `1 solid ${BORDER}` },
  tableRow:     { flexDirection: "row", padding: "9 14", borderBottom: `0.5 solid ${BORDER}` },
  colDesc:      { flex: 3, fontSize: 9, color: CREAM },
  colCat:       { flex: 1, fontSize: 8, color: MUTED, textAlign: "center" },
  colPrice:     { flex: 1, fontSize: 9, fontFamily: "Helvetica", fontWeight: 600, textAlign: "right", color: CREAM },
  headLabel:    { fontSize: 6.5, color: MUTED, textTransform: "uppercase", letterSpacing: 1.5 },

  // Total
  totalWrap:    { backgroundColor: INK_LIGHT, borderRadius: 8, padding: "18 22", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  totalLeft:    { gap: 3 },
  totalEyebrow: { fontSize: 6.5, color: MUTED, textTransform: "uppercase", letterSpacing: 2.5 },
  totalSub:     { fontSize: 8, color: MUTED },
  totalAmount:  { fontFamily: "Helvetica-Bold", fontWeight: 800, fontSize: 32, color: LIME, letterSpacing: -1 },

  // Footer
  footer:       { position: "absolute", bottom: 0, left: 0, right: 0, height: 44, backgroundColor: INK_LIGHT, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 44 },
  footerText:   { fontSize: 7, color: MUTED },

  // Divider
  divider:      { height: 1, backgroundColor: BORDER, marginVertical: 4 },
});

interface DamageReportProps {
  vehicleModel: string;
  summary: string;
  damageMap: Record<string, string>;
  damageNotes: Record<string, { severity: string | null; notes: string }>;
  lineItems: LineItem[];
  photoDataUrl?: string | null;
}

export function DamageReport({ vehicleModel, summary, damageMap, damageNotes, lineItems, photoDataUrl }: DamageReportProps) {
  const total   = lineItems.reduce((s, i) => s + i.aiPrice, 0);
  const date    = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const reportId = `RS-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const getBadge = (sev: string) =>
    sev === "severe" ? [s.badge, s.badgeSev]
    : sev === "moderate" ? [s.badge, s.badgeMod]
    : [s.badge, s.badgeMinor];

  const sevLabel = (sev: string) =>
    sev === "severe" ? "Severe" : sev === "moderate" ? "Moderate" : "Minor";

  const damagedParts = Object.entries(damageMap);

  return (
    <Document title={`RepairSync — ${vehicleModel}`}>
      <Page size="A4" style={s.page}>
        {/* Lime top bar */}
        <View style={s.topBar} />

        <View style={s.inner}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.logo}>REPAIR<Text style={s.logoAccent}>SYNC</Text></Text>
              <Text style={s.logoSub}>Neutral AI Damage Assessment</Text>
            </View>
            <View style={s.metaBlock}>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Report ID</Text>
                <Text style={s.metaVal}>{reportId}</Text>
              </View>
              <View style={[s.metaRow, { marginTop: 8 }]}>
                <Text style={s.metaLabel}>Generated</Text>
                <Text style={s.metaVal}>{date}</Text>
              </View>
            </View>
          </View>

          {/* Vehicle */}
          <View style={s.section}>
            <Text style={s.eyebrow}>Vehicle</Text>
            <Text style={s.vehicleName}>{vehicleModel}</Text>
          </View>

          {/* Evidence photo */}
          {photoDataUrl && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Evidence Photo</Text>
              <Image src={photoDataUrl} style={s.photo} />
              <Text style={s.photoCaption}>Uploaded by customer — external photos may not reveal internal mechanical or structural damage.</Text>
            </View>
          )}

          {/* Technical summary */}
          {summary ? (
            <View style={s.section}>
              <Text style={s.eyebrow}>Technical Summary</Text>
              <Text style={s.summaryText}>{summary}</Text>
            </View>
          ) : null}

          {/* Damage assessment */}
          {damagedParts.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Damage Assessment</Text>
              <View style={s.tableWrap}>
                {damagedParts.map(([partId, severity], idx) => {
                  const notes = damageNotes[partId]?.notes;
                  return (
                    <View key={partId}>
                      {idx > 0 && <View style={s.damageSep} />}
                      <View style={s.damageRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.damageLabel}>{PART_NAMES[partId] ?? partId}</Text>
                          {notes ? <Text style={s.damageNote}>"{notes}"</Text> : null}
                        </View>
                        <Text style={getBadge(severity)}>{sevLabel(severity)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Fair market quote */}
          {lineItems.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Fair Market Quote</Text>
              <View style={s.tableWrap}>
                <View style={s.tableHead}>
                  <Text style={[s.headLabel, { flex: 3 }]}>Description</Text>
                  <Text style={[s.headLabel, { flex: 1, textAlign: "center" }]}>Category</Text>
                  <Text style={[s.headLabel, { flex: 1, textAlign: "right" }]}>Price</Text>
                </View>
                {lineItems.map((item, idx) => (
                  <View key={item.id} style={[s.tableRow, idx === lineItems.length - 1 ? { borderBottom: 0 } : {}]}>
                    <Text style={s.colDesc}>{item.description}</Text>
                    <Text style={s.colCat}>{item.category}</Text>
                    <Text style={s.colPrice}>${item.aiPrice.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View style={s.totalWrap}>
                <View style={s.totalLeft}>
                  <Text style={s.totalEyebrow}>Estimated Total</Text>
                  <Text style={s.totalSub}>Excl. taxes &amp; shop fees</Text>
                </View>
                <Text style={s.totalAmount}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>RepairSync — AI-Powered Fair Market Pricing</Text>
          <Text style={s.footerText}>{reportId} · {date}</Text>
        </View>
      </Page>
    </Document>
  );
}
