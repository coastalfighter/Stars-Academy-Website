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
  gold: "#f28fe0",
  berry: "#d6418f",
  teal: "#6f7df5",
  coral: "#b67cf5",
  blue: "#3aa6e0",
  sky: "#e4f7ff",
  cream: "#fbf8ff",
  sand: "#f3eaff",
} as const;
