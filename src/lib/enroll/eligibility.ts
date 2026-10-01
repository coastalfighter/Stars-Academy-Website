/**
 * The enrollment check's decision rules. Runs in the browser only; answers
 * are never sent anywhere. Mirrors the eligibility STARS publishes: birth to
 * age six, Medicaid / ARKids First / SSI / TEFRA funding, and treatment
 * prescribed by a primary care physician.
 */
export const AGES = ["under3", "3to6", "over6"] as const;
export const COVERAGE = ["medicaid", "ssiTefra", "private", "none", "unsure"] as const;
export const DOCTOR = ["yes", "no", "unsure"] as const;
export const NEEDS = ["speech", "movement", "daily", "medical", "unsure"] as const;

export type Answers = {
  age: (typeof AGES)[number] | null;
  coverage: (typeof COVERAGE)[number] | null;
  doctor: (typeof DOCTOR)[number] | null;
  needs: (typeof NEEDS)[number][];
};

export type Reason = "private" | "none" | "unsure" | "doctor";
export type Outcome = { kind: "fit" | "talk" | "age"; reasons: Reason[] };

export const EMPTY_ANSWERS: Answers = { age: null, coverage: null, doctor: null, needs: [] };

export function evaluate(a: Answers): Outcome {
  if (a.age === "over6") return { kind: "age", reasons: [] };
  const reasons: Reason[] = [];
  if (a.coverage === "private" || a.coverage === "none" || a.coverage === "unsure") reasons.push(a.coverage);
  if (a.doctor !== "yes") reasons.push("doctor");
  return { kind: reasons.length === 0 ? "fit" : "talk", reasons };
}
