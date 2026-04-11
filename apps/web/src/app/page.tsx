"use client";

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { CarDiagram } from "@/components/assessment/CarDiagram";
import { FairQuote } from "@/components/assessment/FairQuote";
import { Fingerprint, Car, ShieldCheck, MapPin, Calendar, Clock } from "lucide-react";

// Robust search link generators
const rockAutoSearch = (partNum: string) => `https://www.rockauto.com/en/partsearch/?partnum=${partNum.replace(/-/g, '')}`;
const hyundaiSearch = (partNum: string) => `https://www.hyundaipartsdeal.com/search?Keywords=${partNum}`;

const BUMPER_DATA = {
  id: "li-1",
  description: "Front Bumper Cover (CAPA Certified)",
  category: "parts" as const,
  oemPartNumber: "86511-3X000",
  aiPrice: 93.79,
  sources: [
    {
      tier: "oem" as const,
      vendor: "HyundaiPartsDeal",
      partNumber: "86511-3X000",
      price: 246.50,
      shipping: 0,
      coreCharge: 0,
      totalLanded: 246.50,
      inStock: true,
      url: hyundaiSearch("86511-3X000"),
    },
    {
      tier: "aftermarket" as const,
      vendor: "RockAuto",
      partNumber: "GMP-2400",
      price: 85.79,
      shipping: 8.00,
      coreCharge: 0,
      totalLanded: 93.79,
      inStock: true,
      url: rockAutoSearch("86511-3X000"),
    },
  ],
};

const MOCK_LINE_ITEMS = [
  BUMPER_DATA,
  {
    id: "li-2",
    description: "Bumper R&I (Front)",
    category: "labor" as const,
    laborHours: 1.5,
    aiPrice: 135.00,
    sources: [],
  },
  {
    id: "li-3",
    description: "Refinish Bumper — Clearcoat/Match",
    category: "paint" as const,
    laborHours: 3.0,
    aiPrice: 270.00,
    sources: [],
  },
];

export default function AssessmentPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-12">
        {/* ── Header Section ── */}
        <section className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-accent/20">
                <Car className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-950 leading-none">
                  2012 Hyundai Elantra
                </h1>
                <p className="text-zinc-500 font-medium">GLS Sedan — Silver Metallic Factory Finish</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
                <Fingerprint className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-widest">
                  VIN: 5NPDH4AE2CH000000
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
                  Price Accuracy Verified
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <div className="text-[9px] font-bold uppercase text-zinc-400">Created</div>
                  <div className="text-sm font-bold text-zinc-950">April 11, 2024</div>
               </div>
               <div className="h-8 w-px bg-zinc-200" />
               <div className="text-right">
                  <div className="text-[9px] font-bold uppercase text-zinc-400">Status</div>
                  <div className="text-sm font-bold text-emerald-600">COMPLETE</div>
               </div>
            </div>
            <button className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline underline-offset-4 transition-all">
              Copy Link to Dashboard
            </button>
          </div>
        </section>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-8">
            <CarDiagram />
            
            <div className="glass-card bg-zinc-950 text-white border-none">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <h3 className="font-bold uppercase tracking-widest text-zinc-400 text-xs">Technical Summary</h3>
              </div>
              <p className="text-lg text-zinc-100 leading-relaxed font-serif">
                Front bumper cover sustained direct impact. Fascia is cracked across the lower intake. 
                Energy absorber is deformed. Frame rails are intact. Recommended repair involves 
                full bumper replacement with CAPA certified aftermarket part to match 2012 factory tolerances.
              </p>
            </div>
          </div>

          <aside className="sticky top-24 space-y-6">
            <div className="glass-card">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">Repair Insights</h4>
              <div className="space-y-6">
                {[
                  { label: "Location", value: "Primary Front-Impact-Zone", icon: MapPin },
                  { label: "Turnaround", value: "2-3 Business Days", icon: Clock },
                  { label: "Certifications", value: "CAPA / I-CAR Gold", icon: ShieldCheck },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-400 group-hover:text-accent">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase text-zinc-400">{item.label}</div>
                      <div className="text-sm font-bold text-zinc-950">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-1 rounded-3xl bg-zinc-100 border border-zinc-200">
               <button className="w-full py-4 rounded-[22px] bg-white border border-zinc-200 text-zinc-950 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95">
                  Download Full PDF Report
               </button>
            </div>
          </aside>
        </div>

        {/* ── Price Breakdown ── */}
        <section id="quote">
           <FairQuote items={MOCK_LINE_ITEMS} />
        </section>
      </div>
    </LayoutWrapper>
  );
}

AssessmentPage.getLayout = function getLayout(page: React.ReactNode) {
  return page; // Layout is handled inside the component for this demo
};
