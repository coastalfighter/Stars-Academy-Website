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
  gold: "#f2c230",
  berry: "#c4323a",
  teal: "#2f8f8a",
  coral: "#e8735a",
  blue: "#4f86c6",
  sky: "#dcebf5",
  cream: "#fbf7ef",
  sand: "#f3ecdf",
} as const;
