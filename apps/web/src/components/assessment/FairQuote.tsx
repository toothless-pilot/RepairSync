"use client";

import { useState } from "react";
import { 
  ExternalLink, Package, Wrench, Paintbrush, Cpu, Box, 
  ChevronDown, ChevronUp, CheckCircle2 
} from "lucide-react";

// Mock types locally for this branch since packages/types is missing
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

const TIER = {
  oem:          { label: "OEM",         color: "text-zinc-950", bg: "bg-accent", border: "border-accent" },
  aftermarket:  { label: "Aftermarket", color: "text-accent",    bg: "bg-zinc-950", border: "border-accent/20" },
  salvage:      { label: "Salvage",     color: "text-zinc-500",  bg: "bg-zinc-100", border: "border-zinc-200" },
};

export function FairQuote({ items }: { items: LineItem[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">Fair Market Estimate</h2>
          <p className="text-sm text-zinc-500 max-w-md">
            AI-validated quote based on real-time availability from 150+ parts distributors and regional labor averages.
          </p>
        </div>
        <div className="flex gap-2">
          {["oem", "aftermarket", "salvage"].map((t) => (
             <div key={t} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${TIER[t as "oem"].border} ${TIER[t as "oem"].bg} ${TIER[t as "oem"].color}`}>
               {TIER[t as "oem"].label}
             </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="group flex flex-col rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:border-accent/30 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-6 px-6 py-5">
              {/* Description */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-zinc-400" />
                  <span className="font-bold text-zinc-950">{item.description}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                  {item.oemPartNumber && <span>OEM: {item.oemPartNumber}</span>}
                  {item.laborHours && <span>{item.laborHours}H Labor</span>}
                  <span className="uppercase text-accent font-bold px-1.5 py-0.5 bg-black rounded">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right md:w-32">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-0.5">Best Market Rate</div>
                <div className="text-2xl font-mono font-black text-zinc-950">${item.aiPrice.toFixed(2)}</div>
              </div>

              {/* Toggle */}
              <div className="md:w-32">
                {item.sources.length > 0 ? (
                  <button 
                    onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold transition-all hover:bg-black"
                  >
                    {expandedRow === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span>{item.sources.length} Sources</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-[10px] font-bold uppercase text-zinc-300">Standard Labor</div>
                )}
              </div>
            </div>

            {/* Expanded Sources */}
            {expandedRow === item.id && (
              <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-5 space-y-3">
                {item.sources.map((source, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 bg-white">
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${TIER[source.tier].bg} ${TIER[source.tier].color} border ${TIER[source.tier].border}`}>
                        {TIER[source.tier].label}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-zinc-950">{source.vendor}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{source.partNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-zinc-400 mb-0.5">Total Landed</div>
                        <div className="text-lg font-mono font-bold text-zinc-950">${source.totalLanded.toFixed(2)}</div>
                      </div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        className="p-2 rounded-full border border-zinc-200 text-zinc-400 hover:text-accent hover:border-accent hover:bg-black transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="rounded-3xl bg-zinc-950 p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Final Assessment</div>
            <h3 className="text-3xl font-serif text-white">Fair Quote Estimate</h3>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Estimated Market Total</div>
            <div className="text-5xl font-mono font-black text-accent tracking-tighter">
              ${items.reduce((acc, i) => acc + i.aiPrice, 0).toFixed(2)}
            </div>
            <div className="text-[9px] text-zinc-500 mt-2 italic">Excludes local taxes and shop disposal fees</div>
          </div>
        </div>
      </div>
    </div>
  );
}
