"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  ExternalLink,
  FileAudio2,
  ImageIcon,
  Loader2,
  Mic,
  Pencil,
  Trash2,
  Type,
} from "lucide-react";
import type { Id } from "@memvella/backend/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import { PrimaryButton, SecondaryButton } from "@memvella/ui";
import { formatLastEditedLabel, formatMemoryRecordTypeLabel } from "@/lib/memory-record-ui";

const RECORD_ICON_MAP = {
  text: Type,
  media: ImageIcon,
  audio: FileAudio2,
  voice: Mic,
} as const;

function MemoryAssetCard({
  asset,
  title,
}: {
  asset: {
    id: string;
    assetType: "image" | "video" | "audio";
    fileName: string | null;
    mimeType: string | null;
    externalUrl: string | null;
    resolvedUrl: string | null;
  };
  title: string;
}) {
  if (asset.assetType === "image") {
    return (
      <div className="relative h-72 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <Image
          src={asset.resolvedUrl ?? ""}
          alt={asset.fileName ?? title}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  if (asset.assetType === "video") {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm">
        <video controls src={asset.resolvedUrl ?? ""} className="w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <audio controls src={asset.resolvedUrl ?? ""} className="w-full" />
    </div>
  );
}

export default function OrganiserMemoryDetailPage() {
  const params = useParams<{ memoryId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const memoryRecordId = params.memoryId as Id<"memoryRecords">;
  const memoryDetail = useQuery(api.memories.getMemoryRecordDetail, { memoryRecordId });
  const deleteMemoryRecord = useMutation(api.memories.deleteMemoryRecord);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!memoryDetail || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMemoryRecord({ memoryRecordId });
      toast({
        tone: "success",
        title: "Memory deleted",
        description: `"${memoryDetail.title}" was removed from this Workspace.`,
      });
      router.push("/circle/memories");
    } catch (error) {
      toast({
        tone: "error",
        title: "Memory was not deleted",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (memoryDetail === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-family-primary" />
        <p className="text-lg font-medium text-text-secondary">Loading this memory...</p>
      </div>
    );
  }

  if (memoryDetail === null) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-32">
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-text-primary">Memory not found</p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            This record is no longer available in the current Workspace.
          </p>
        </div>
        <SecondaryButton href="/circle/memories">
          Back to memories
        </SecondaryButton>
      </div>
    );
  }

  const Icon = RECORD_ICON_MAP[memoryDetail.recordType];

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-32" data-testid="memory-detail">
      <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
              {formatMemoryRecordTypeLabel(memoryDetail.recordType)}
            </p>
            <h1
              className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary"
              data-testid="memory-detail-title"
            >
              {memoryDetail.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-family-accent/10 px-3 py-2 text-sm font-semibold text-family-accent">
                {memoryDetail.dateLabel}
              </span>
              <span className="rounded-full bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
                Updated {formatLastEditedLabel(memoryDetail.lastEditedAt)}
              </span>
            </div>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </section>

      {memoryDetail.assets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-family text-lg font-bold text-text-primary">
            Assets
          </h2>
          {memoryDetail.assets.map((asset) => (
            <MemoryAssetCard key={asset.id} asset={asset} title={memoryDetail.title} />
          ))}
        </section>
      ) : null}

      {memoryDetail.story ? (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-family text-lg font-bold text-text-primary">
            Story
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-text-secondary">
            {memoryDetail.story}
          </p>
        </section>
      ) : null}

      {memoryDetail.transcript ? (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-family text-lg font-bold text-text-primary">
            Transcript
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-text-secondary">
            {memoryDetail.transcript}
          </p>
        </section>
      ) : null}

      {memoryDetail.externalUrl ? (
        <section className="rounded-xl border border-family-accent/15 bg-family-accent/10 p-6">
          <h2 className="font-family text-lg font-bold text-text-primary">
            Linked audio
          </h2>
          <a
            href={memoryDetail.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-[56px] items-center rounded-full bg-family-accent px-5 text-base font-semibold text-white"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Open link
          </a>
        </section>
      ) : null}

      <div className="space-y-3">
        <PrimaryButton href={`/circle/memories/${memoryDetail.id}/edit`}>
          <Pencil className="h-5 w-5" />
          Edit memory
        </PrimaryButton>

        {showDeleteConfirm ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
            <p className="text-base font-bold text-red-700">
              Delete &ldquo;{memoryDetail.title}&rdquo;?
            </p>
            <p className="text-sm text-red-600">
              This cannot be undone. The memory will be permanently removed from this Workspace.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                data-testid="confirm-delete-memory-button"
                className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#B91C1C] px-5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex h-[48px] items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-text-secondary disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            data-testid="delete-memory-button"
            className="flex h-[72px] w-full items-center justify-center gap-2 rounded-full bg-[#B91C1C] px-6 text-lg font-semibold text-white shadow-md transition-transform active:scale-95"
          >
            <Trash2 className="h-5 w-5" />
            Delete memory
          </button>
        )}

        <SecondaryButton href="/circle/memories">
          Back to memories
        </SecondaryButton>
      </div>
    </div>
  );
}
