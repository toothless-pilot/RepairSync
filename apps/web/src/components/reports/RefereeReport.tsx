"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Assessment, LineItem as BaseLineItem } from "@repair-sync/types";

export type DisputeLineItem = BaseLineItem & {
  shopPrice: number;
  status: "overcharge" | "missing_safety" | "agreed";
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    borderBottom: 2,
    borderBottomColor: "#6366f1",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366f1",
  },
  reportMeta: {
    textAlign: "right",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#18181b",
  },
  subtitle: {
    fontSize: 10,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#18181b",
    textTransform: "uppercase",
    backgroundColor: "#f4f4f5",
    padding: 6,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: "#71717a",
    fontWeight: "bold",
  },
  value: {
    fontSize: 10,
    color: "#18181b",
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 0.5,
    borderBottomColor: "#f4f4f5",
    paddingVertical: 8,
    alignItems: "center",
  },
  colDesc: { flex: 3, fontSize: 9 },
  colPrice: { flex: 1, textAlign: "right", fontSize: 9 },
  colStatus: { flex: 1, textAlign: "center", fontSize: 8 },
  statusBadge: {
    padding: "2 6",
    borderRadius: 10,
    fontSize: 7,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: "#f4f4f5",
    paddingTop: 10,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 8,
    color: "#a1a1aa",
    marginTop: 10,
    fontStyle: "italic",
  },
});

interface RefereeReportProps {
  assessment: Omit<Assessment, 'lineItems'> & { lineItems: DisputeLineItem[] };
}

export function RefereeReport({ assessment }: RefereeReportProps) {
  const totalDiscrepancy = (assessment.lineItems || []).reduce(
    (acc: number, curr: DisputeLineItem) => acc + (curr.shopPrice - curr.aiPrice),
    0
  );

  return (
    <Document title={`Referee Report - ${assessment.vehicleDescription}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>REPAIRSYNC</Text>
            <Text style={styles.subtitle}>Neutral AI Referee Assessment</Text>
          </View>
          <View style={styles.reportMeta}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>REPORT #RS-{assessment._id?.toString().slice(-6).toUpperCase()}</Text>
            <Text style={{ fontSize: 8, color: "#71717a" }}>Generated: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Identification</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Vehicle:</Text>
            <Text style={styles.value}>{assessment.vehicleDescription}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Severity:</Text>
            <Text style={[styles.value, { textTransform: "capitalize", fontWeight: "bold" }]}>{assessment.overallSeverity}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Summary</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#3f3f46" }}>
            {assessment.summary}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Item Dispute Ledger</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDesc, { fontWeight: "bold" }]}>Description</Text>
              <Text style={[styles.colPrice, { fontWeight: "bold" }]}>Shop Est.</Text>
              <Text style={[styles.colPrice, { fontWeight: "bold" }]}>Referee</Text>
              <Text style={[styles.colStatus, { fontWeight: "bold" }]}>Status</Text>
            </View>

            {(assessment.lineItems || []).map((item: DisputeLineItem) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colPrice}>${item.shopPrice.toFixed(2)}</Text>
                <Text style={styles.colPrice}>${item.aiPrice.toFixed(2)}</Text>
                <View style={styles.colStatus}>
                  <Text style={[
                    styles.statusBadge, 
                    { 
                      backgroundColor: item.status === 'overcharge' ? '#fee2e2' : item.status === 'missing_safety' ? '#fef3c7' : '#dcfce7',
                      color: item.status === 'overcharge' ? '#991b1b' : item.status === 'missing_safety' ? '#92400e' : '#166534'
                    }
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 20, alignItems: "flex-end", paddingRight: 40 }}>
          <View style={{ width: 200, borderTop: 1, borderTopColor: "#e4e4e7", paddingTop: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: "#71717a" }}>Total Net Discrepancy:</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: totalDiscrepancy > 0 ? "#b91c1c" : "#166534" }}>
                ${totalDiscrepancy.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 8, color: "#71717a" }}>
            RepairSync | Automated Neutral Indemnity Assessment
          </Text>
          <Text style={styles.disclaimer}>
            This report represents a neutral AI-driven assessment of damage based on industry-standard pricing and safety protocols. External photos may not reveal internal mechanical or structural compromises.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
