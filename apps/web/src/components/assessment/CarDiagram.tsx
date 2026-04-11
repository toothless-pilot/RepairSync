"use client";

import { useState } from "react";
import { Info } from "lucide-react";

type Severity = "none" | "minor" | "moderate" | "severe";

interface PartDamage {
  id: string;
  name: string;
  severity: Severity;
}

const COLORS: Record<Severity, string> = {
  none: "transparent",
  minor: "#FEF08A",    // yellow-200
  moderate: "#FDBA74", // orange-300
  severe: "#F87171",   // red-400
};

export function CarDiagram() {
  const [damagedParts, setDamagedParts] = useState<Record<string, Severity>>({
    front_bumper: "moderate",
    energy_absorber: "severe",
  });

  const parts = [
    { id: "front_bumper", label: "Front Bumper Cover", d: "M 100 20 L 500 20 L 500 60 L 100 60 Z" }, // simplified path for placeholder
    { id: "hood", label: "Hood", d: "M 150 60 L 450 60 L 450 160 L 150 160 Z" },
    // I will use a more realistic line-art SVG below
  ];

  return (
    <div className="glass-card relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-950">Vehicle Damage Map</h3>
          <p className="text-sm text-zinc-500">Click panels to inspect or modify assessment</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Interactive View</span>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center py-10">
        {/*
            Realistic TOP-DOWN line art of a 2012 Elantra style sedan.
            I will use an SVG that mimics the "Bicycle Ref" line art style.
        */}
        <svg viewBox="0 0 600 300" className="w-full h-auto max-w-2xl drop-shadow-2xl">
          {/* Main Chassis Outline */}
          <path d="M 120 50 Q 80 50 80 80 L 80 220 Q 80 250 120 250 L 480 250 Q 520 250 520 220 L 520 80 Q 520 50 480 50 Z" 
                fill="none" stroke="#27272a" strokeWidth="2" />
          
          {/* Front Bumper Area */}
          <g className="cursor-pointer group/part" onClick={() => console.log('Bumper clicked')}>
            <path d="M 80 80 Q 80 50 120 50 L 130 50 L 130 250 L 120 250 Q 80 250 80 220 Z" 
                  fill={damagedParts.front_bumper ? COLORS[damagedParts.front_bumper] : "white"} 
                  stroke="#000" strokeWidth="1.5" className="transition-all duration-300 group-hover/part:stroke-[3px]" />
            <text x="50" y="150" className="text-[10px] font-bold fill-zinc-400 opacity-0 group-hover/part:opacity-100 transition-opacity" 
                  transform="rotate(-90, 50, 150)">FRONT BUMPER</text>
          </g>

          {/* Hood */}
          <g className="cursor-pointer group/part">
            <path d="M 130 65 L 240 75 L 240 225 L 130 235 Z" 
                  fill="white" stroke="#000" strokeWidth="1.5" className="transition-all group-hover/part:fill-zinc-50" />
          </g>

          {/* Roof */}
          <g className="cursor-pointer group/part">
            <path d="M 240 75 L 400 75 L 400 225 L 240 225 Z" 
                  fill="white" stroke="#000" strokeWidth="1.5" className="transition-all group-hover/part:fill-zinc-50" />
          </g>

          {/* Rear Bumper */}
          <g className="cursor-pointer group/part">
            <path d="M 520 80 Q 520 50 480 50 L 470 50 L 470 250 L 480 250 Q 520 250 520 220 Z" 
                  fill="white" stroke="#000" strokeWidth="1.5" className="transition-all group-hover/part:stroke-2" />
          </g>

          {/* Windshield */}
          <path d="M 230 75 L 240 75 L 240 225 L 230 225 Z" fill="#f4f4f5" stroke="#000" strokeWidth="1" />
          
          {/* Trunk */}
          <path d="M 400 80 L 470 80 L 470 220 L 400 220 Z" fill="none" stroke="#000" strokeWidth="1" />
        </svg>

        {/* Legend / Callout overlay */}
        <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-2">
          {["minor", "moderate", "severe"].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm border border-black/10" style={{ backgroundColor: COLORS[s as Severity] }} />
              <span className="text-[9px] font-bold uppercase tracking-tight text-zinc-400">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-950 flex items-center justify-center">
            <Info className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-950">1 Component Flagged</div>
            <div className="text-xs text-zinc-500">Front Bumper Cover Replacement Recommended</div>
          </div>
        </div>
        <button className="btn-accent">
          Scan for Details
        </button>
      </div>
    </div>
  );
}
