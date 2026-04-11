import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAssessment = mutation({
  args: {
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { imageUrl }) => {
    const id = await ctx.db.insert("assessments", {
      status: "uploading",
      imageUrl,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const updateAssessment = mutation({
  args: {
    id: v.id("assessments"),
    damageZones: v.array(
      v.object({
        zoneName: v.string(),
        severity: v.string(),
        description: v.string(),
        confidence: v.number(),
      })
    ),
    overallSeverity: v.string(),
    repairPriority: v.string(),
    vehicleDescription: v.string(),
    summary: v.string(),
    disclaimer: v.string(),
  },
  handler: async (ctx, { id, ...result }) => {
    await ctx.db.patch(id, {
      status: "complete",
      ...result,
    });
  },
});

export const failAssessment = mutation({
  args: {
    id: v.id("assessments"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "failed" });
  },
});

export const setAnalyzing = mutation({
  args: {
    id: v.id("assessments"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "analyzing" });
  },
});

export const updateImageUrl = mutation({
  args: {
    id: v.id("assessments"),
    imageUrl: v.string(),
  },
  handler: async (ctx, { id, imageUrl }) => {
    await ctx.db.patch(id, { imageUrl });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveStorageId = mutation({
  args: {
    id: v.id("assessments"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { id, storageId }) => {
    const imageUrl = await ctx.storage.getUrl(storageId);
    await ctx.db.patch(id, { imageUrl: imageUrl ?? "" });
    return imageUrl;
  },
});

export const getAssessment = query({
  args: {
    id: v.id("assessments"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
