import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAssessment = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, { assessmentId }) => {
    return await ctx.db.get(assessmentId);
  },
});
