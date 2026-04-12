"use client";

export type { AssessmentStatus, SeverityLevel, DamageZone, Assessment } from "@repair-sync/types";

export function useAssessment(assessmentId: string) {
  // Convex integration pending — returns undefined until backend is wired up
  return {
    assessment: null as null,
    isLoading: false,
  };
}
