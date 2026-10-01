/**
 * Per-frame scene state shared by every 3D object. `p` is the *smoothed*
 * chapter progress (scroll progress damped over time) so the scene glides
 * even when the wheel moves in steps.
 */
export const sceneState = {
  p: 0,
  elapsed: 0,
};

/** Service colors in star-point order (matches content/services.ts). */
export const BRAND = {
  ink: "#17153a",
  pink: "#ff8fd8",
  rose: "#ff6fae",
  periwinkle: "#8f9bff",
  lilac: "#c58cff",
  azure: "#3aa6e0",
  ice: "#e6f8ff",
  cream: "#f7fdff",
  sand: "#d9f4ff",
} as const;
