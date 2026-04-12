"use client";

import { LineItem } from "@repair-sync/types";
import { AlertCircle, AlertTriangle, CheckCircle2, Flag } from "lucide-react";
import { useDisputeStore } from "@/store/useDisputeStore";

interface DisputeShieldProps {
  items: LineItem[];
}

export function DisputeShield({ items }: DisputeShieldProps) {
  const { flaggedItems, toggleFlag } = useDisputeStore();

  const getStatusConfig = (status: LineItem["status"]) => {
    switch (status) {
      case "overcharge":
        return {
          icon: AlertCircle,
          color: "text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          label: "Overcharge",
        };
      case "missing_safety":
        return {
          icon: AlertTriangle,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          label: "Safety Risk",
        };
      case "agreed":
      default:
        return {
          icon: CheckCircle2,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          label: "Agreed",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Dispute Shield™ Comparison
        </h2>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Shop vs AI Truth Layer</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30">
        <div className="flex border-b border-white/5 bg-zinc-900/50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
          <div className="flex-grow">Item Description</div>
          <div className="w-24 text-right">Shop Est.</div>
          <div className="w-24 text-right">Referee</div>
          <div className="w-32 text-center">Status</div>
          <div className="w-12"></div>
        </div>

        <div className="divide-y divide-white/5">
          {items.map((item) => {
            const config = getStatusConfig(item.status);
            const StatusIcon = config.icon;
            const isFlagged = flaggedItems.has(item.id);

            return (
              <div 
                key={item.id} 
                className={`flex items-center px-6 py-5 transition-all hover:bg-white/5 ${isFlagged ? 'bg-indigo-500/5' : ''}`}
              >
                <div className="flex-grow">
                  <div className="font-medium text-zinc-200">{item.description}</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500">{item.category}</div>
                </div>

                <div className="w-24 text-right text-sm font-mono text-zinc-400">
                  ${item.shopPrice.toLocaleString()}
                </div>

                <div className="w-24 text-right text-sm font-mono font-bold text-white">
                  ${item.aiPrice.toLocaleString()}
                </div>

                <div className="w-32 flex justify-center">
                  <div className={`flex items-center gap-1.5 rounded-full border ${config.border} ${config.bg} px-3 py-1`}>
                    <StatusIcon className={`h-3 w-3 ${config.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="w-12 flex justify-end">
                  <button 
                    onClick={() => toggleFlag(item.id)}
                    className={`p-2 rounded-lg transition-all ${isFlagged ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'}`}
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-indigo-500/5 px-6 py-4 flex items-center justify-between border-t border-indigo-500/10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Total Net Discrepancy</span>
          <div className="text-xl font-bold text-white">
            ${items.reduce((acc, curr) => acc + (curr.shopPrice - curr.aiPrice), 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
