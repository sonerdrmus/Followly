import { create } from 'zustand';

type QuickActionsState = {
  open: boolean;
  show: () => void;
  hide: () => void;
};

/** The create-style shortcut sheet, reachable from every tab header. */
export const useQuickActions = create<QuickActionsState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
