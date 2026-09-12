import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getSeniorProfileByMode } from "./circleAuth";

type DbCtx = MutationCtx | QueryCtx;

export type MemoryAssetInput = {
  assetType: "image" | "video" | "audio";
  storageId?: Id<"_storage"> | null;
  externalUrl?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

type ResolvedMemoryAsset = {
  id: Id<"memoryAssets">;
  assetType: Doc<"memoryAssets">["assetType"];
  fileName: string | null;
  mimeType: string | null;
  externalUrl: string | null;
  resolvedUrl: string | null;
};

function uniqueAssets(
  assets: MemoryAssetInput[],
) {
  return assets.filter(
    (asset) => Boolean(asset.storageId || asset.externalUrl),
  );
}

export function buildMemorySearchText(record: {
  title: string;
  story?: string | null;
  transcript?: string | null;
  externalUrl?: string | null;
}) {
  const { title, story, transcript, externalUrl } = record;
  const encoder = new TextEncoder();
  // Leave room for the original record, including unusually long legacy content.
  const originalBytes = encoder.encode(JSON.stringify({ title, story, transcript, externalUrl })).length;
  const budget = Math.min(128_000, Math.max(0, 900_000 - originalBytes));
  const text = [title, story, transcript].filter(Boolean).join("\n");
  return new TextDecoder().decode(encoder.encode(text).subarray(0, budget), { stream: true });
}

export function formatMemoryDateLabel(memoryDate: string | null) {
  if (!memoryDate) {
    return "No date added";
  }

  const parsedDate = new Date(`${memoryDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return memoryDate;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function summarizeMemory(
  record: Pick<Doc<"memoryRecords">, "story" | "transcript" | "externalUrl">,
) {
  const sourceText =
    record.story ?? record.transcript ?? record.externalUrl ?? "No details added yet.";

  return sourceText.length > 140
    ? `${sourceText.slice(0, 137).trimEnd()}...`
    : sourceText;
}

async function resolveAssets(
  ctx: DbCtx,
  memoryRecordId: Id<"memoryRecords">,
) {
  const assets = await ctx.db
    .query("memoryAssets")
    .withIndex("by_memoryRecordId_and_sortOrder", (query) =>
      query.eq("memoryRecordId", memoryRecordId),
    )
    .take(20);

  return (
    await Promise.all(
      assets.map(async (asset) => ({
        id: asset._id,
        assetType: asset.assetType,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        externalUrl: asset.externalUrl,
        resolvedUrl: asset.storageId
          ? await ctx.storage.getUrl(asset.storageId)
          : asset.externalUrl,
      })),
    )
  ).filter(
    (asset): asset is ResolvedMemoryAsset => asset.resolvedUrl !== null,
  );
}

export async function createMemoryRecord(
  ctx: MutationCtx,
  args: {
    seniorProfileId: Id<"seniorProfiles">;
    circleMembershipId: Id<"circleMemberships"> | null;
    recordType: Doc<"memoryRecords">["recordType"];
    title: string;
    story?: string | null;
    transcript?: string | null;
    memoryDate?: string | null;
    externalUrl?: string | null;
    assets?: MemoryAssetInput[];
  },
) {
  const now = Date.now();
  const memoryRecordId = await ctx.db.insert("memoryRecords", {
    seniorProfileId: args.seniorProfileId,
    recordType: args.recordType,
    title: args.title,
    story: args.story ?? null,
    transcript: args.transcript ?? null,
    searchText: buildMemorySearchText(args),
    memoryDate: args.memoryDate ?? null,
    externalUrl: args.externalUrl ?? null,
    createdByCircleMembershipId: args.circleMembershipId,
    updatedByCircleMembershipId: args.circleMembershipId,
    lastEditedAt: now,
  });

  const assets = uniqueAssets(args.assets ?? []);
  for (const [sortOrder, asset] of assets.entries()) {
    await ctx.db.insert("memoryAssets", {
      seniorProfileId: args.seniorProfileId,
      memoryRecordId,
      assetType: asset.assetType,
      storageId: asset.storageId ?? null,
      externalUrl: asset.externalUrl ?? null,
      mimeType: asset.mimeType ?? null,
      fileName: asset.fileName ?? null,
      sortOrder,
    });
  }

  return memoryRecordId;
}

export async function replaceMemoryAssets(
  ctx: MutationCtx,
  args: {
    seniorProfileId: Id<"seniorProfiles">;
    memoryRecordId: Id<"memoryRecords">;
    assets: MemoryAssetInput[];
  },
) {
  const existingAssets = await ctx.db
    .query("memoryAssets")
    .withIndex("by_memoryRecordId_and_sortOrder", (query) =>
      query.eq("memoryRecordId", args.memoryRecordId),
    )
    .take(20);

  for (const asset of existingAssets) {
    if (asset.storageId) {
      await ctx.storage.delete(asset.storageId);
    }
    await ctx.db.delete(asset._id);
  }

  const nextAssets = uniqueAssets(args.assets);
  for (const [sortOrder, asset] of nextAssets.entries()) {
    await ctx.db.insert("memoryAssets", {
      seniorProfileId: args.seniorProfileId,
      memoryRecordId: args.memoryRecordId,
      assetType: asset.assetType,
      storageId: asset.storageId ?? null,
      externalUrl: asset.externalUrl ?? null,
      mimeType: asset.mimeType ?? null,
      fileName: asset.fileName ?? null,
      sortOrder,
    });
  }
}

export async function deleteMemoryRecordCascade(
  ctx: MutationCtx,
  memoryRecordId: Id<"memoryRecords">,
) {
  const existingAssets = await ctx.db
    .query("memoryAssets")
    .withIndex("by_memoryRecordId_and_sortOrder", (query) =>
      query.eq("memoryRecordId", memoryRecordId),
    )
    .take(20);

  for (const asset of existingAssets) {
    if (asset.storageId) {
      await ctx.storage.delete(asset.storageId);
    }
    await ctx.db.delete(asset._id);
  }

  await ctx.db.delete(memoryRecordId);
}

export async function listMemoryCardsForSenior(
  ctx: QueryCtx,
  seniorProfileId: Id<"seniorProfiles">,
  limit = 100,
) {
  const records = await ctx.db
    .query("memoryRecords")
    .withIndex("by_seniorProfileId_and_lastEditedAt", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .order("desc")
    .take(limit);

  return await Promise.all(records.map((record) => resolveMemoryCard(ctx, record)));
}

export async function resolveMemoryCard(ctx: QueryCtx, record: Doc<"memoryRecords">) {
      const primaryAsset = await ctx.db.query("memoryAssets")
        .withIndex("by_memoryRecordId_and_sortOrder", (q) => q.eq("memoryRecordId", record._id))
        .first();
      const previewUrl = primaryAsset?.storageId
        ? await ctx.storage.getUrl(primaryAsset.storageId)
        : primaryAsset?.externalUrl ?? null;

      return {
        id: record._id,
        title: record.title,
        recordType: record.recordType,
        story: record.story,
        transcript: record.transcript,
        memoryDate: record.memoryDate,
        dateLabel: formatMemoryDateLabel(record.memoryDate),
        externalUrl: record.externalUrl,
        summary: summarizeMemory(record),
        previewUrl,
        previewAssetType: primaryAsset?.assetType ?? null,
        lastEditedAt: record.lastEditedAt,
      };
}

export async function getMemoryDetailForSenior(
  ctx: QueryCtx,
  args: {
    seniorProfileId: Id<"seniorProfiles">;
    memoryRecordId: Id<"memoryRecords">;
  },
) {
  const record = await ctx.db.get(args.memoryRecordId);
  if (!record || record.seniorProfileId !== args.seniorProfileId) {
    return null;
  }

  const assets = await resolveAssets(ctx, record._id);

  return {
    id: record._id,
    title: record.title,
    recordType: record.recordType,
    story: record.story,
    transcript: record.transcript,
    memoryDate: record.memoryDate,
    dateLabel: formatMemoryDateLabel(record.memoryDate),
    externalUrl: record.externalUrl,
    summary: summarizeMemory(record),
    lastEditedAt: record.lastEditedAt,
    assets,
  };
}

export async function listMemoryCardsForCircle(
  ctx: QueryCtx,
  circleId: Id<"circles">,
) {
  const seniorProfile = await getSeniorProfileByMode(ctx, circleId, "assisted");
  if (!seniorProfile) {
    return [];
  }

  return await listMemoryCardsForSenior(ctx, seniorProfile._id, 100);
}

export async function getMemoryDetailForCircle(
  ctx: QueryCtx,
  args: {
    circleId: Id<"circles">;
    memoryRecordId: Id<"memoryRecords">;
  },
) {
  const seniorProfile = await getSeniorProfileByMode(
    ctx,
    args.circleId,
    "assisted",
  );
  if (!seniorProfile) {
    return null;
  }

  return await getMemoryDetailForSenior(ctx, {
    seniorProfileId: seniorProfile._id,
    memoryRecordId: args.memoryRecordId,
  });
}
