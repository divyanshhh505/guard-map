import { create } from 'zustand';

type View = 'upload' | 'map' | 'stats' | 'insights' | 'settings';

interface AppState {
  activeView: View;
  setActiveView: (view: View) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'map',
  setActiveView: (view) => set({ activeView: view }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
