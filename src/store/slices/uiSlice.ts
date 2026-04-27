import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  searchQuery: string;
  mobileMenuOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  toasts: [],
  searchQuery: "",
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    addToast(state, action: PayloadAction<Omit<Toast, "id">>) {
      state.toasts.push({ ...action.payload, id: Date.now().toString() });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  addToast,
  removeToast,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
