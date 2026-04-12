"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DamageReport } from "./DamageReport";
import { FileDown, Loader2 } from "lucide-react";
import type { LineItem } from "@/lib/damage-pricing";

interface Props {
  vehicleModel: string;
  summary: string;
  damageMap: Record<string, string>;
  damageNotes: Record<string, { severity: string | null; notes: string }>;
  lineItems: LineItem[];
  photoDataUrl?: string | null;
}

export function DamageReportButton(props: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <button disabled className="btn-ghost w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparing PDF...
      </button>
    );
  }

  const filename = `RepairSync-${props.vehicleModel.replace(/\s+/g, "-")}-${Date.now().toString(36).toUpperCase()}.pdf`;

  return (
    <PDFDownloadLink
      document={<DamageReport {...props} />}
      fileName={filename}
      style={{ textDecoration: "none", width: "100%" }}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="btn-ghost w-full flex items-center justify-center gap-2"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...</>
          ) : (
            <><FileDown className="h-4 w-4" /> Download Full PDF Report</>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
