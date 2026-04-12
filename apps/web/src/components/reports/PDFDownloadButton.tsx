"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { RefereeReport } from "./RefereeReport";
import { Assessment } from "@repair-sync/types";
import { FileDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PDFDownloadButtonProps {
  assessment: Assessment;
}

export function PDFDownloadButton({ assessment }: PDFDownloadButtonProps) {
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch for react-pdf
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button disabled className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white/50 cursor-not-allowed">
        <Loader2 className="h-5 w-5 animate-spin" />
        Initializing PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<RefereeReport assessment={assessment} />}
      fileName={`Referee-Report-RS-${assessment._id.slice(-6).toUpperCase()}.pdf`}
      style={{ textDecoration: "none", width: "100%" }}
    >
      {({ loading }) => (
        <button 
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5" />
              Export Referee Report
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
