"use client";

import { LineItem, PriceSource } from "@repair-sync/types";
import {
  ExternalLink, Package, Wrench, Paintbrush, Cpu, Box,
  ChevronDown, ChevronUp, CheckCircle2,
} from "lucide-react";
import { useState } from "react";

// ─── Types & Constants ────────────────────────────────────────────────────────

interface FairQuoteProps {
  items: LineItem[];
}

const TIER = {
  oem:          { label: "OEM",         color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  aftermarket:  { label: "Aftermarket", color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20"    },
  salvage:      { label: "Salvage",     color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
} satisfies Record<PriceSource["tier"], object>;

const CATEGORY = {
  parts:       { icon: Package,    color: "text-indigo-400", label: "Part"        },
  labor:       { icon: Wrench,     color: "text-sky-400",    label: "Labor"       },
  paint:       { icon: Paintbrush, color: "text-violet-400", label: "Paint"       },
  supplies:    { icon: Box,        color: "text-zinc-400",   label: "Supplies"    },
  calibration: { icon: Cpu,        color: "text-amber-400",  label: "Calibration" },
} satisfies Record<LineItem["category"], object>;

// ─── Source Row ───────────────────────────────────────────────────────────────

function SourceRow({ source, isBest }: { source: PriceSource; isBest: boolean }) {
  const t = TIER[source.tier];
  return (
    <div
      className={`grid gap-x-4 gap-y-1 rounded-xl border px-4 py-3 transition-all
        grid-cols-1
        sm:grid-cols-[auto_1fr_auto]
        ${isBest
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-white/5 bg-zinc-900/30"
        }`}
    >
      {/* Col 1: tier + vendor */}
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${t.bg} ${t.color} ${t.border}`}>
          {t.label}
        </span>
        <span className="text-sm font-semibold text-zinc-200 truncate">{source.vendor}</span>
        {isBest && (
          <span className="hidden sm:flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-2.5 w-2.5" /> Selected
          </span>
        )}
      </div>

      {/* Col 2: part# + pricing breakdown */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 min-w-0 text-xs font-mono">
        <span className="text-zinc-500 truncate hidden sm:block">{source.partNumber}</span>
        <span className="text-zinc-400">Part: <span className="text-zinc-200 font-semibold">${source.price.toFixed(2)}</span></span>
        {source.shipping > 0 && <span className="text-zinc-400">Ship: <span className="text-zinc-200">${source.shipping.toFixed(2)}</span></span>}
        {source.coreCharge > 0 && <span className="text-zinc-400">Core: <span className="text-zinc-200">${source.coreCharge.toFixed(2)}</span></span>}
        <span className={`font-bold ${isBest ? "text-emerald-300" : "text-zinc-200"}`}>
          Total: ${source.totalLanded.toFixed(2)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${source.inStock ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
          {source.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Col 3: link */}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 self-center justify-self-end rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 whitespace-nowrap transition-all hover:bg-white/15 hover:text-white"
      >
        View listing <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ─── Quote Row ─────────────────────────────────────────────────────────────────

function QuoteRow({ item }: { item: LineItem }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY[item.category];
  const Icon = meta.icon;
  const hasSources = item.sources.length > 0;

  const sortedSources = [...item.sources].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.totalLanded - b.totalLanded;
  });

  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/20 transition-all hover:border-white/10">
      {/*
          Responsive grid:
          mobile  → 1 col (stacked)
          sm      → [description | price + button]
          lg      → [description | fixed price col | fixed button col]
      */}
      <div className="grid items-center gap-x-6 gap-y-3 px-5 py-4
        grid-cols-1
        sm:grid-cols-[1fr_auto_auto]">

        {/* ── Description ── */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
            <span className="font-semibold text-zinc-100 truncate">{item.description}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {item.oemPartNumber && (
              <span className="font-mono text-[10px] text-zinc-500">
                OEM# <span className="text-zinc-400">{item.oemPartNumber}</span>
              </span>
            )}
            {item.laborHours !== undefined && (
              <span className="font-mono text-[10px] text-zinc-500">{item.laborHours}h labor</span>
            )}
            <span className={`text-[9px] font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
          </div>
        </div>

        {/* ── Price ── */}
        <div className="text-right shrink-0 w-28">
          <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-0.5">Fair Market Price</div>
          <div className="text-xl font-black text-white">${item.aiPrice.toFixed(2)}</div>
        </div>

        {/* ── Sources toggle ── */}
        <div className="shrink-0 w-32">
          {hasSources ? (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-400 transition-all hover:text-white hover:bg-white/10"
            >
              {expanded
                ? <><ChevronUp className="h-3 w-3" /> Hide Sources</>
                : <><ChevronDown className="h-3 w-3" /> {item.sources.length} Source{item.sources.length !== 1 ? "s" : ""}</>
              }
            </button>
          ) : (
            <div className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-center text-xs text-zinc-700">
              Labor only
            </div>
          )}
        </div>
      </div>

      {/* Expanded sources */}
      {expanded && hasSources && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
            Market sources — sorted by best available price
          </p>
          {sortedSources.map((src, i) => (
            <SourceRow
              key={`${src.tier}-${src.vendor}`}
              source={src}
              isBest={i === 0 && src.inStock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FairQuote({ items }: FairQuoteProps) {
  const subtotals = {
    "Parts & Supplies": items.filter(i => i.category === "parts" || i.category === "supplies").reduce((s, i) => s + i.aiPrice, 0),
    "Labor":            items.filter(i => i.category === "labor").reduce((s, i) => s + i.aiPrice, 0),
    "Paint":            items.filter(i => i.category === "paint").reduce((s, i) => s + i.aiPrice, 0),
    "Calibration":      items.filter(i => i.category === "calibration").reduce((s, i) => s + i.aiPrice, 0),
  };
  const grandTotal = items.reduce((s, i) => s + i.aiPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          RepairSync Fair Market Quote
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Best available in-stock price selected per part across OEM, aftermarket, and salvage sources.
        </p>
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-2">
        {(["oem", "aftermarket", "salvage"] as const).map((t) => (
          <div key={t} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${TIER[t].bg} ${TIER[t].border} ${TIER[t].color}`}>
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
            {TIER[t].label}
          </div>
        ))}
      </div>

      {/* Column header — only visible on sm+ */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-x-6 px-5 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
        <span>Description</span>
        <span className="w-28 text-right">Price</span>
        <span className="w-32 text-center">Sources</span>
      </div>

      {/* Line items */}
      <div className="space-y-2">
        {items.map((item) => <QuoteRow key={item.id} item={item} />)}
      </div>

      {/* Totals */}
      <div className="rounded-2xl border border-white/8 bg-zinc-900/40 overflow-hidden">
        <div className="divide-y divide-white/5">
          {(Object.entries(subtotals) as [string, number][]).map(([label, value]) =>
            value > 0 ? (
              <div key={label} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="font-mono text-sm text-zinc-200">${value.toFixed(2)}</span>
              </div>
            ) : null
          )}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 bg-zinc-900/60 px-6 py-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Estimated Total</div>
            <div className="text-xs text-zinc-600 mt-0.5">Excludes applicable taxes & fees</div>
          </div>
          <div className="text-3xl font-black text-white">${grandTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
