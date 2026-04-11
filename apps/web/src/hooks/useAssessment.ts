"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type AssessmentStatus =
  | "pending"
  | "processing"
  | "complete"
  | "failed";

export type SeverityLevel = "cosmetic" | "minor" | "major" | "critical";

export interface DamageZone {
  zone: string;
  severity: SeverityLevel;
  notes: string;
}

export interface Assessment {
  _id: Id<"assessments">;
  status: AssessmentStatus;
  overallSeverity: SeverityLevel;
  vehicleDescription: string;
  summary: string;
  damageZones: DamageZone[];
  repairPriority: string;
  imageUrl: string;
  _creationTime: number;
}

export function useAssessment(assessmentId: string) {
  const data = useQuery(api.assessments.getAssessment, {
    assessmentId: assessmentId as Id<"assessments">,
  });

  return {
    assessment: data as Assessment | null | undefined,
    isLoading: data === undefined,
  };
}
