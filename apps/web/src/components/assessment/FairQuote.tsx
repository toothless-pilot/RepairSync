"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface PriceSource {
  tier: "oem" | "aftermarket" | "salvage";
  vendor: string;
  partNumber: string;
  price: number;
  shipping: number;
  coreCharge: number;
  totalLanded: number;
  inStock: boolean;
  url: string;
}

interface LineItem {
  id: string;
  description: string;
  category: "parts" | "labor" | "paint" | "supplies" | "calibration";
  oemPartNumber?: string;
  laborHours?: number;
  aiPrice: number;
  sources: PriceSource[];
}

const TIER_STYLES = {
  oem:         { label: "OEM",         color: "text-ink",   bg: "bg-lime",       border: "border-lime"        },
  aftermarket:  { label: "Aftermarket", color: "text-lime",  bg: "bg-transparent", border: "border-lime/30"    },
  salvage:      { label: "Salvage",     color: "text-muted", bg: "bg-transparent", border: "border-muted/30"   },
};

const CATEGORY_LABEL: Record<string, string> = {
  parts: "Parts", labor: "Labor", paint: "Paint", supplies: "Supplies", calibration: "Calibration",
};

function SourceRow({ source, isBest }: { source: PriceSource; isBest: boolean }) {
  const t = TIER_STYLES[source.tier];
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-xl"
      style={{
        background: isBest ? "rgba(198,232,58,0.06)" : "rgba(247,248,242,0.02)",
        border: `1px solid ${isBest ? "rgba(198,232,58,0.2)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${t.bg} ${t.color} ${t.border}`}
        >
          {t.label}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-cream truncate">{source.vendor}</div>
          <div className="text-[10px] font-mono text-muted">{source.partNumber}</div>
        </div>
        {isBest && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-lime"
            style={{ background: "rgba(198,232,58,0.1)", border: "1px solid rgba(198,232,58,0.2)" }}>
            Selected
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted mb-0.5">Total Landed</div>
          <div className={`text-base font-mono font-black ${isBest ? "text-lime" : "text-cream"}`}>
            ${source.totalLanded.toFixed(2)}
          </div>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-muted hover:text-lime transition-colors"
          style={{ border: "1px solid var(--border)" }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function QuoteRow({ item }: { item: LineItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasSources = item.sources.length > 0;

  const sortedSources = [...item.sources].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.totalLanded - b.totalLanded;
  });

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ border: "1px solid var(--border)", background: "#111318" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4">
        {/* Description */}
        <div className="min-w-0">
          <div className="font-semibold text-cream truncate">{item.description}</div>
          <div className="flex items-center gap-3 mt-1">
            {item.oemPartNumber && (
              <span className="font-mono text-[10px] text-muted">OEM# {item.oemPartNumber}</span>
            )}
            {item.laborHours && (
              <span className="font-mono text-[10px] text-muted">{item.laborHours}h</span>
            )}
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-lime"
              style={{ background: "rgba(198,232,58,0.1)" }}
            >
              {CATEGORY_LABEL[item.category]}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted mb-0.5">Fair Market</div>
          <div className="text-2xl font-mono font-black text-cream">${item.aiPrice.toFixed(2)}</div>
        </div>

        {/* Toggle */}
        <div className="shrink-0 w-32">
          {hasSources ? (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-cream transition-colors"
              style={{ border: "1px solid var(--border)" }}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {item.sources.length} Source{item.sources.length !== 1 ? "s" : ""}
            </button>
          ) : (
            <div className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-wide text-muted">
              Labor Only
            </div>
          )}
        </div>
      </div>

      {expanded && hasSources && (
        <div className="px-5 pb-4 pt-3 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="eyebrow mb-3" style={{ fontSize: "0.65rem" }}>
            Market Sources — sorted by best available price
          </p>
          {sortedSources.map((src, i) => (
            <SourceRow key={`${src.tier}-${src.vendor}`} source={src} isBest={i === 0 && src.inStock} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FairQuote({ items }: { items: LineItem[] }) {
  const grandTotal = items.reduce((s, i) => s + i.aiPrice, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Fair Market Estimate</div>
          <h2
            className="text-2xl font-bold tracking-[-0.03em] text-cream"
            style={{ fontFamily: "var(--font-display)" }}
          >
            RepairSync Quote
          </h2>
          <p className="text-sm text-muted mt-1 max-w-md">
            AI-validated pricing across 150+ distributors and regional labor indexes.
          </p>
        </div>

        <div className="flex gap-2">
          {(["oem", "aftermarket", "salvage"] as const).map((t) => (
            <div
              key={t}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${TIER_STYLES[t].border} ${TIER_STYLES[t].color}`}
            >
              {TIER_STYLES[t].label}
            </div>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <QuoteRow key={item.id} item={item} />
        ))}
      </div>

      {/* Grand Total */}
      <div
        className="flex flex-wrap items-center justify-between gap-6 rounded-2xl px-8 py-7"
        style={{ background: "#111318", border: "1px solid rgba(198,232,58,0.15)" }}
      >
        <div>
          <div className="eyebrow mb-1">Final Assessment</div>
          <p className="text-sm text-muted max-w-xs">
            Excludes applicable taxes, disposal fees, and shop-specific markup.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted mb-1">Estimated Total</div>
          <div
            className="text-5xl font-mono font-black text-lime tracking-tighter"
          >
            ${grandTotal.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
