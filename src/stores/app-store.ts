// 全局状态管理 - Zustand Store

import { create } from "zustand";
import type { Infant } from "@/types";

// 应用导航状态
interface AppState {
  // 当前选中的婴儿
  selectedInfant: Infant | null;
  setSelectedInfant: (infant: Infant | null) => void;
  
  // 侧边栏折叠状态
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedInfant: null,
  setSelectedInfant: (infant) => set({ selectedInfant: infant }),
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// 搜索状态
interface SearchState {
  keyword: string;
  setKeyword: (keyword: string) => void;
  clearKeyword: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: "",
  setKeyword: (keyword) => set({ keyword }),
  clearKeyword: () => set({ keyword: "" }),
}));
