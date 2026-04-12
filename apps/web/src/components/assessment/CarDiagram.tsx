"use client";

import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";

type Severity = "minor" | "moderate" | "severe";

const PARTS = [
  { id: "windshield",            label: "Windshield" },
  { id: "back-passenger-window", label: "Rear Window" },
  { id: "front-door",            label: "Front Door" },
  { id: "rear-door",             label: "Rear Door" },
  { id: "front-bumper",          label: "Front Bumper" },
  { id: "rear-bumper",           label: "Rear Bumper" },
  { id: "front-headlight",       label: "Front Headlight" },
  { id: "rear-taillight",        label: "Rear Taillight" },
  { id: "front-wheel",           label: "Front Wheel" },
  { id: "rear-wheel",            label: "Rear Wheel" },
];

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

interface CarDiagramProps {
  damage?: Record<string, Severity>;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  minor:    "rgba(198,232,58,0.18)",
  moderate: "rgba(198,232,58,0.38)",
  severe:   "rgba(198,232,58,0.62)",
};
const SEVERITY_STROKE: Record<Severity, string> = {
  minor:    "rgba(198,232,58,0.45)",
  moderate: "rgba(198,232,58,0.75)",
  severe:   "#C6E83A",
};

export function CarDiagram({ damage = {} }: CarDiagramProps) {
  const [damaged, setDamaged]   = useState<Record<string, Severity>>(damage);

  useEffect(() => {
    setDamaged(damage);
  }, [damage]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered]   = useState<string | null>(null);

  function getFill(id: string) {
    if (selected === id) return "rgba(198,232,58,0.32)";
    if (hovered  === id) return "rgba(198,232,58,0.18)";
    return "transparent";
  }
  function getStroke(id: string) {
    if (selected === id) return "#C6E83A";
    if (hovered  === id) return "rgba(198,232,58,0.55)";
    return "transparent";
  }
  function getStrokeDash(id: string) {
    return selected === id ? "5 3" : "none";
  }

  function handleClick(id: string) {
    setSelected((prev) => (prev === id ? null : id));
  }

  const selectedLabel = PARTS.find((p) => p.id === selected)?.label;
  const selectedSeverity = selected ? damaged[selected] : undefined;
  const flaggedCount = Object.keys(damaged).length;

  return (
    <div className="glass-card relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-lg font-bold tracking-[-0.02em] text-cream"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Vehicle Damage Map
          </h3>
          <p className="text-sm text-muted mt-0.5">Click panels to inspect or modify assessment</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          <span className="eyebrow" style={{ fontSize: "0.65rem" }}>Interactive View</span>
        </div>
      </div>

      {/* Selected part callout */}
      {selected && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4"
          style={{ background: "rgba(198,232,58,0.08)", border: "1px solid rgba(198,232,58,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-lime" />
            <span className="text-sm font-semibold text-cream">{selectedLabel}</span>
            {selectedSeverity && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-lime"
                style={{ background: "rgba(198,232,58,0.12)" }}>
                {selectedSeverity}
              </span>
            )}
            {!selectedSeverity && (
              <span className="text-xs text-muted">No damage recorded</span>
            )}
          </div>
          <button onClick={() => setSelected(null)} className="text-muted hover:text-cream transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Car SVG */}
      <div className="relative flex justify-center">
        <svg
          id="car-svg"
          viewBox="0 0 680 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto max-w-2xl"
          style={{ cursor: "default" }}
        >
          <defs>
            <radialGradient id="dg-glow" cx="50%" cy="60%" r="50%">
              <stop offset="0%"   stopColor="#C6E83A" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#C6E83A" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="dg-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2A2D38"/>
              <stop offset="100%" stopColor="#16181F"/>
            </linearGradient>
            <linearGradient id="dg-roof" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3C3F50"/>
              <stop offset="100%" stopColor="#22252F"/>
            </linearGradient>
            <filter id="dg-shadow">
              <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#000" floodOpacity="0.55"/>
            </filter>
          </defs>

          {/* Ground glow + shadow */}
          <ellipse cx="340" cy="305" rx="280" ry="40" fill="url(#dg-glow)"/>
          <ellipse cx="340" cy="298" rx="240" ry="18" fill="black" fillOpacity="0.45"/>

          {/* ── Visual layer (non-interactive) ── */}
          <g filter="url(#dg-shadow)" pointerEvents="none">
            <path d="M90 245 Q88 205 115 195 L175 178 Q225 125 300 115 L380 112 Q445 113 510 132 L565 165 L590 198 Q598 210 598 245 Z"
                  fill="url(#dg-body)" stroke="#3A3D4E" strokeWidth="1.5"/>
            <path d="M195 195 Q230 145 300 128 L390 126 Q450 128 500 168 L515 195 Z"
                  fill="url(#dg-roof)" stroke="#44475A" strokeWidth="1.5"/>
            <path d="M205 192 Q240 148 305 133 L390 131 Q444 131 488 165 L500 192 Z"
                  fill="#1A2035" stroke="#2D3248" strokeWidth="1"/>
            <path d="M225 190 Q255 155 308 140 L330 138 L295 188 Z"
                  fill="white" fillOpacity="0.04"/>
            <line x1="355" y1="131" x2="355" y2="243" stroke="#3A3D4E" strokeWidth="1.5"/>
            <rect x="268" y="210" width="26" height="5" rx="2.5" fill="#4A4D5E" stroke="#5A5D70" strokeWidth="0.8"/>
            <rect x="400" y="210" width="26" height="5" rx="2.5" fill="#4A4D5E" stroke="#5A5D70" strokeWidth="0.8"/>
            <path d="M90 245 Q88 260 96 270 L590 270 Q598 260 598 245"
                  fill="#111318" stroke="#3A3D4E" strokeWidth="1.5"/>
            <path d="M103 220 Q100 205 115 198 L148 194 L156 220 Z"
                  fill="white" fillOpacity="0.22" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
            <path d="M575 203 Q588 201 594 213 L596 237 L570 237 Z"
                  fill="#FF3A3A" fillOpacity="0.22" stroke="#FF3A3A" strokeWidth="0.8" strokeOpacity="0.5"/>
            <path d="M112 246 Q115 286 180 286 Q245 286 248 246" fill="#0A0B0F" stroke="#3A3D4E" strokeWidth="1.5"/>
            <path d="M428 246 Q431 286 496 286 Q561 286 564 246" fill="#0A0B0F" stroke="#3A3D4E" strokeWidth="1.5"/>
          </g>

          {/* Front wheel */}
          <g pointerEvents="none">
            <circle cx="180" cy="278" r="42" fill="#0F1018" stroke="#2A2D38" strokeWidth="2"/>
            <circle cx="180" cy="278" r="30" fill="none" stroke="#3A3D4E" strokeWidth="8"/>
            <circle cx="180" cy="278" r="14" fill="#1C1E27" stroke="#4A4D5E" strokeWidth="2"/>
            {[[180,248,180,266],[180,290,180,308],[150,278,168,278],[192,278,210,278],
              [159,257,170,268],[190,288,201,299],[159,299,170,288],[190,268,201,257]].map(([x1,y1,x2,y2],i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
            ))}
            <circle cx="180" cy="278" r="38" fill="none" stroke="#C6E83A" strokeWidth="1.5" strokeOpacity="0.25"/>
          </g>

          {/* Rear wheel */}
          <g pointerEvents="none">
            <circle cx="496" cy="278" r="42" fill="#0F1018" stroke="#2A2D38" strokeWidth="2"/>
            <circle cx="496" cy="278" r="30" fill="none" stroke="#3A3D4E" strokeWidth="8"/>
            <circle cx="496" cy="278" r="14" fill="#1C1E27" stroke="#4A4D5E" strokeWidth="2"/>
            {[[496,248,496,266],[496,290,496,308],[466,278,484,278],[508,278,526,278],
              [475,257,486,268],[506,288,517,299],[475,299,486,288],[506,268,517,257]].map(([x1,y1,x2,y2],i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
            ))}
            <circle cx="496" cy="278" r="38" fill="none" stroke="#C6E83A" strokeWidth="1.5" strokeOpacity="0.25"/>
          </g>

          {/* ── Damage indicator dots ── */}
          {Object.keys(damaged).map((id) => {
            const dotPos: Record<string, [number, number]> = {
              "windshield":            [280, 160],
              "back-passenger-window": [418, 162],
              "front-door":            [265, 218],
              "rear-door":             [408, 218],
              "front-headlight":       [130, 208],
              "rear-taillight":        [583, 220],
              "rear-bumper":           [530, 258],
              "front-bumper":          [170, 258],
              "front-wheel":           [180, 278],
              "rear-wheel":            [496, 278],
            };
            const pos = dotPos[id];
            if (!pos) return null;
            return (
              <circle key={id} cx={pos[0]} cy={pos[1]} r="5"
                fill="#C6E83A" pointerEvents="none" />
            );
          })}

          {/* ── Interactive hit areas ── */}
          {[
            { id: "windshield",            d: "M210 191 Q244 148 308 133 L355 131 L355 191 Z" },
            { id: "back-passenger-window", d: "M355 131 L391 130 Q444 131 488 165 L500 192 L355 192 Z" },
            { id: "front-door",            d: "M178 192 L355 192 L355 243 L178 243 Q170 230 170 212 Q170 198 178 192 Z" },
            { id: "rear-door",             d: "M355 192 L464 192 L464 243 L355 243 Z" },
            { id: "front-bumper",          d: "M87 241 L260 241 L256 273 Q162 277 91 271 Q82 259 87 241 Z" },
            { id: "rear-bumper",           d: "M400 243 L598 243 Q599 262 590 271 L400 271 Z" },
            { id: "rear-taillight",        d: "M570 201 Q587 199 595 211 L597 239 L569 239 Z" },
            { id: "front-headlight",       d: "M100 222 Q97 203 113 196 L150 192 L158 222 Z" },
          ].map(({ id, d }) => (
            <path
              key={id}
              d={d}
              fill={getFill(id)}
              stroke={getStroke(id)}
              strokeWidth={selected === id ? 2 : 1.5}
              strokeDasharray={getStrokeDash(id)}
              style={{ cursor: "pointer", transition: "fill 0.16s, stroke 0.16s" }}
              onClick={() => handleClick(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Wheel hit areas */}
          {[
            { id: "front-wheel", cx: 180 },
            { id: "rear-wheel",  cx: 496 },
          ].map(({ id, cx }) => (
            <circle
              key={id}
              cx={cx} cy={278} r={46}
              fill={getFill(id)}
              stroke={getStroke(id)}
              strokeWidth={selected === id ? 2 : 1.5}
              strokeDasharray={getStrokeDash(id)}
              style={{ cursor: "pointer", transition: "fill 0.16s, stroke 0.16s" }}
              onClick={() => handleClick(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-0 flex flex-col gap-2">
          {(["minor", "moderate", "severe"] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ background: SEVERITY_COLOR[s] }} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(198,232,58,0.1)", border: "1px solid rgba(198,232,58,0.2)" }}
          >
            <Info className="h-4 w-4 text-lime" />
          </div>
          <div>
            <div className="text-sm font-bold text-cream">
              {flaggedCount === 0 ? "No Damage Recorded" : `${flaggedCount} Component${flaggedCount !== 1 ? "s" : ""} Flagged`}
            </div>
            <div className="text-xs text-muted">
              {flaggedCount === 0
                ? "Click panels above to mark damage"
                : Object.keys(damaged).map(id => PART_NAMES[id] ?? id).join(", ")}
            </div>
          </div>
        </div>
        <button className="btn-accent">Scan for Details</button>
      </div>
    </div>
  );
}
