import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
    status: v.union(
      v.literal("uploading"),
      v.literal("analyzing"),
      v.literal("complete"),
      v.literal("failed")
    ),
    imageUrl: v.optional(v.string()),
    damageZones: v.optional(
      v.array(
        v.object({
          zoneName: v.string(),
          severity: v.string(),
          description: v.string(),
          confidence: v.number(),
        })
      )
    ),
    overallSeverity: v.optional(v.string()),
    repairPriority: v.optional(v.string()),
    vehicleDescription: v.optional(v.string()),
    summary: v.optional(v.string()),
    disclaimer: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
