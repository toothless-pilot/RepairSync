"use client";

import { useParams } from "next/navigation";
import { SeverityLevel, DamageZone } from "@/hooks/useAssessment";
import { Shield, AlertTriangle, CheckCircle2, Clock, Car, FileText, Zap, Fingerprint } from "lucide-react";
import { FairQuote } from "@/components/PriceBreakdown";
import dynamic from "next/dynamic";
const PDFDownloadButton = dynamic(
  () => import("@/components/reports/PDFDownloadButton").then(m => m.PDFDownloadButton),
  { ssr: false }
);
import { generateMockLineItems } from "@/lib/mock-estimates";
import { Assessment } from "@repair-sync/types";

const SEVERITY_STYLES: Record<SeverityLevel, { color: string; bg: string; border: string; icon: any }> = {
  cosmetic: { color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: Shield        },
  minor:    { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2  },
  major:    { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20",  icon: AlertTriangle },
  critical: { color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    icon: Zap           },
};

const MOCK_ASSESSMENT: Assessment = {
  _id: "demo-assessment",
  vin: "5NPDH4AE2CH000000",   // 2012 Elantra — trailing digits placeholder
  status: "complete",
  overallSeverity: "minor",
  vehicleDescription: "2012 Hyundai Elantra GLS Sedan",
  summary:
    "Front bumper cover sustained direct impact damage. The bumper fascia shows cracking and paint delamination across the lower grille area. The foam energy absorber is compressed and must be replaced. No structural frame rail damage detected. Repair scope is cosmetic/structural bumper replacement only.",
  damageZones: [
    { zone: "Front Bumper Cover",       severity: "major",   notes: "Cracked across lower grille area. Full replacement required." },
    { zone: "Energy Absorber (Foam)",   severity: "major",   notes: "Compressed — cannot be restored. Replace with new." },
    { zone: "Bumper Retainer Brackets", severity: "minor",   notes: "Two of four upper mounting clips broken. Replace hardware kit." },
    { zone: "Frame Rails / Structure",  severity: "cosmetic", notes: "No deformation detected. No structural repair needed." },
  ],
  repairPriority: "Standard — No safety-critical systems affected. Schedule within 30 days.",
  imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  lineItems: generateMockLineItems(),
  _creationTime: Date.now(),
};

export default function AssessmentPage() {
  const params = useParams();
  const assessment: Assessment = MOCK_ASSESSMENT;
  const sevStyle = SEVERITY_STYLES[assessment.overallSeverity as SeverityLevel];
  const SevIcon = sevStyle.icon;

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_50%)] opacity-40" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* ── Header ── */}
        <header className="mb-12 flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                {assessment.vehicleDescription}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2 backdrop-blur">
                <Fingerprint className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">VIN</div>
                  <div className="font-mono text-sm font-semibold text-zinc-200 tracking-widest">{assessment.vin}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-3 py-1.5 border border-white/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{assessment.status}</span>
              </div>
              <p className="font-mono text-xs text-zinc-600">ID: {params.id as string}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 rounded-2xl border ${sevStyle.border} ${sevStyle.bg} px-6 py-3 transition-all hover:scale-105`}>
            <SevIcon className={`h-6 w-6 ${sevStyle.color}`} />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Damage Severity</span>
              <span className={`text-lg font-bold capitalize ${sevStyle.color}`}>{assessment.overallSeverity}</span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
          <div className="space-y-12 xl:col-span-3">
            {/* Summary */}
            <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <FileText className="h-5 w-5" />
                  <h2 className="font-bold uppercase tracking-wider">Damage Summary</h2>
                </div>
                <p className="text-lg leading-relaxed text-zinc-300">{assessment.summary}</p>
              </div>
            </section>

            {/* Fair Quote */}
            <section className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8">
              <FairQuote items={assessment.lineItems} />
            </section>

            {/* Damage Zones */}
            <section>
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Damage Zones
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {assessment.damageZones.map((zone: DamageZone, idx: number) => {
                  const z = SEVERITY_STYLES[zone.severity as SeverityLevel];
                  return (
                    <div key={idx} className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-zinc-900/30 p-6 transition-all hover:border-white/10 hover:bg-zinc-900/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{zone.zone}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${z.bg} ${z.color} ${z.border}`}>
                          {zone.severity}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">{zone.notes}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40">
              <img
                src={assessment.imageUrl}
                alt={assessment.vehicleDescription}
                className="aspect-[4/3] w-full object-cover opacity-80 transition-all group-hover:scale-105 group-hover:opacity-100"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                <span className="text-xs text-white/60 italic">Primary Evidence Photo</span>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-emerald-400">
                <Clock className="h-5 w-5" />
                <h3 className="font-bold text-white uppercase tracking-tight text-sm">Repair Priority</h3>
              </div>
              <p className="text-sm leading-relaxed text-emerald-200/80">{assessment.repairPriority}</p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[38%] bg-gradient-to-r from-emerald-500 to-emerald-400" />
                </div>
                <span className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">Urgency: 38 / 100</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <PDFDownloadButton assessment={assessment} />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-24 border-t border-white/5 px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2 text-zinc-600">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-[0.2em]">RepairSync — AI-Powered Fair Market Pricing</span>
        </div>
      </footer>
    </main>
  );
}
