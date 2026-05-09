"use client";

import { useEffect, useState } from "react";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { CarDiagram } from "@/components/assessment/CarDiagram";
import { FairQuote } from "@/components/assessment/FairQuote";
import { Fingerprint, Car, ShieldCheck, MapPin, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { buildLineItems, buildSummary, type LineItem } from "@/lib/damage-pricing";
import { lookupVin } from "@/lib/vin-lookup";

const DamageReportButton = dynamic(
  () => import("@/components/reports/DamageReportButton").then(m => m.DamageReportButton),
  { ssr: false }
);

export default function AssessmentPage() {
  const [vehicleModel, setVehicleModel] = useState("2012 Hyundai Elantra");
  const [vin, setVin] = useState("5NPDH4AE2CH000000");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [summary, setSummary] = useState("");
  const [damagePhoto, setDamagePhoto] = useState<string | null>(null);
  const [damageMap, setDamageMap] = useState<Record<string, "minor" | "moderate" | "severe">>({});
  const [damageNotes, setDamageNotes] = useState<Record<string, { severity: string | null; notes: string }>>({});

  useEffect(() => {
    const savedModel = localStorage.getItem("rs_vehicle_model");
    if (savedModel) {
      setVehicleModel(savedModel);
      const prefix = lookupVin(savedModel);
      if (prefix) setVin(`${prefix}...`);
    }

    const photo = localStorage.getItem("rs_damage_photo");
    if (photo) setDamagePhoto(photo);

    const savedDamage = localStorage.getItem("rs_damage_notes");
    if (savedDamage) {
      try {
        const parsed = JSON.parse(savedDamage) as Record<string, { severity: "minor" | "moderate" | "severe" | null; notes: string }>;
        setDamageNotes(parsed);
        setLineItems(buildLineItems(parsed));
        setSummary(buildSummary(parsed));
        // Build severity-only map for the diagram
        const dm: Record<string, "minor" | "moderate" | "severe"> = {};
        for (const [id, { severity }] of Object.entries(parsed)) {
          if (severity) dm[id] = severity as "minor" | "moderate" | "severe";
        }
        setDamageMap(dm);
      } catch {}
    }
  }, []);

  return (
    <LayoutWrapper>
      <div className="space-y-12">

        {/* ── Header ── */}
        <section className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#1C1E27", border: "1px solid var(--border)" }}
              >
                <Car className="h-7 w-7 text-lime" />
              </div>
              <div>
                <h1
                  className="text-4xl font-extrabold tracking-[-0.04em] text-cream leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {vehicleModel}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "#1C1E27", border: "1px solid var(--border)" }}
              >
                <Fingerprint className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs font-mono font-bold text-muted uppercase tracking-widest">
                  VIN: {vin}
                </span>
              </div>
              <div className="tag-pill">
                <ShieldCheck className="h-3 w-3" />
                Price Accuracy Verified
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="eyebrow mb-0.5">Created</div>
                <div className="text-sm font-bold text-cream">
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div className="h-8 w-px" style={{ background: "var(--border)" }} />
              <div className="text-right">
                <div className="eyebrow mb-0.5">Status</div>
                <div className="text-sm font-bold text-lime">COMPLETE</div>
              </div>
            </div>
            <button className="text-xs font-medium text-muted hover:text-cream transition-colors underline underline-offset-4">
              Copy Link to Dashboard
            </button>
          </div>
        </section>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-8">
            <CarDiagram damage={damageMap} />

            {/* Technical Summary */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-lime" />
                <span className="eyebrow">Technical Summary</span>
              </div>
              {summary ? (
                <p className="leading-relaxed" style={{ color: "rgba(247,248,242,0.75)", fontSize: "1.02rem" }}>
                  {summary}
                </p>
              ) : (
                <p className="text-muted text-sm italic">
                  No damage notes recorded. Mark damaged parts on the{" "}
                  <a href="/" className="text-lime underline underline-offset-4">home page</a>{" "}
                  to generate a summary.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sticky top-28 space-y-4">
            <div className="glass-card space-y-6">
              <div className="eyebrow">Repair Insights</div>
              {[
                { label: "Location",       value: "Primary Front-Impact-Zone", icon: MapPin     },
                { label: "Turnaround",     value: "2–3 Business Days",         icon: Clock      },
                { label: "Certifications", value: "CAPA / I-CAR Gold",         icon: ShieldCheck },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div
                    className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: "#1C1E27", border: "1px solid var(--border)" }}
                  >
                    <item.icon className="h-4 w-4 text-muted" />
                  </div>
                  <div>
                    <div className="eyebrow" style={{ fontSize: "0.65rem" }}>{item.label}</div>
                    <div className="text-sm font-semibold text-cream mt-0.5">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Uploaded damage photo */}
            {damagePhoto && (
              <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border)" }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-lime" />
                  <span className="eyebrow" style={{ fontSize: "0.65rem" }}>Evidence Photo</span>
                </div>
                <div className="relative">
                  <img
                    src={damagePhoto}
                    alt="Uploaded damage photo"
                    className="w-full object-cover"
                    style={{ maxHeight: "220px" }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                    style={{ background: "linear-gradient(to top, rgba(10,11,15,0.85), transparent)" }}>
                    <span className="text-[10px] text-muted italic">Uploaded by customer</span>
                  </div>
                </div>
              </div>
            )}

            <DamageReportButton
              vehicleModel={vehicleModel}
              summary={summary}
              damageMap={damageMap}
              damageNotes={damageNotes}
              lineItems={lineItems}
              photoDataUrl={damagePhoto}
            />
          </aside>
        </div>

        {/* ── Price Breakdown ── */}
        <section id="quote">
          {lineItems.length > 0 ? (
            <FairQuote items={lineItems} />
          ) : (
            <div
              className="glass-card text-center py-16"
              style={{ border: "1px solid rgba(198,232,58,0.1)" }}
            >
              <div className="eyebrow mb-3">No Damage Recorded</div>
              <p className="text-muted text-sm">
                Go back to the{" "}
                <a href="/" className="text-lime underline underline-offset-4">home page</a>,
                click the car panels to mark damaged parts, then return here for your quote.
              </p>
            </div>
          )}
        </section>
      </div>
    </LayoutWrapper>
  );
}
