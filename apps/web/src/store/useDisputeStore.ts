import { create } from "zustand";

interface DisputeState {
  flaggedItems: Set<string>;
  notes: Record<string, string>;
  toggleFlag: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  clearDispute: () => void;
}

export const useDisputeStore = create<DisputeState>((set) => ({
  flaggedItems: new Set(),
  notes: {},
  toggleFlag: (id) =>
    set((state) => {
      const newFlags = new Set(state.flaggedItems);
      if (newFlags.has(id)) {
        newFlags.delete(id);
      } else {
        newFlags.add(id);
      }
      return { flaggedItems: newFlags };
    }),
  updateNote: (id, note) =>
    set((state) => ({
      notes: { ...state.notes, [id]: note },
    })),
  clearDispute: () => set({ flaggedItems: new Set(), notes: {} }),
}));
