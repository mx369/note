import { create } from "zustand";

type ThemeState = {
  theme: "light" | "dark";
  toggle: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem("orbit-theme") as "light" | "dark") ?? "light",
  toggle: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("orbit-theme", next);
      return { theme: next };
    }),
}));
