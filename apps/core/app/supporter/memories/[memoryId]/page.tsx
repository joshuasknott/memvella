"use client";

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
import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
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
      <div className="relative h-72 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
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
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <video controls src={asset.resolvedUrl ?? ""} className="w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
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

  const handleDelete = async () => {
    if (!memoryDetail) {
      return;
    }

    const confirmed = window.confirm(`Delete "${memoryDetail.title}" from this Circle?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMemoryRecord({ memoryRecordId });
      toast({
        tone: "success",
        title: "Memory deleted",
        description: `"${memoryDetail.title}" was removed from this Circle.`,
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
    }
  };

  if (memoryDetail === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
        <p className="text-lg font-medium text-gray-600">Loading this memory...</p>
      </div>
    );
  }

  if (memoryDetail === null) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-32">
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-bold text-gray-900">Memory not found</p>
          <p className="mt-2 text-lg leading-relaxed text-gray-500">
            This record is no longer available in the current Circle.
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
    <div className="flex w-full flex-col gap-6 px-4 pb-32">
      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-800">
              {formatMemoryRecordTypeLabel(memoryDetail.recordType)}
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              {memoryDetail.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                {memoryDetail.dateLabel}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600">
                Updated {formatLastEditedLabel(memoryDetail.lastEditedAt)}
              </span>
            </div>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </section>

      {memoryDetail.assets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-headline text-2xl font-bold text-gray-900">
            Assets
          </h2>
          {memoryDetail.assets.map((asset) => (
            <MemoryAssetCard key={asset.id} asset={asset} title={memoryDetail.title} />
          ))}
        </section>
      ) : null}

      {memoryDetail.story ? (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-headline text-2xl font-bold text-gray-900">
            Story
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            {memoryDetail.story}
          </p>
        </section>
      ) : null}

      {memoryDetail.transcript ? (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-headline text-2xl font-bold text-gray-900">
            Transcript
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-gray-700">
            {memoryDetail.transcript}
          </p>
        </section>
      ) : null}

      {memoryDetail.externalUrl ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="font-headline text-2xl font-bold text-gray-900">
            Linked audio
          </h2>
          <a
            href={memoryDetail.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-[56px] items-center rounded-full bg-[#1D4ED8] px-5 text-base font-semibold text-white"
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

        <button
          type="button"
          onClick={handleDelete}
          className="flex h-[72px] w-full items-center justify-center gap-2 rounded-full bg-[#B91C1C] px-6 text-lg font-semibold text-white shadow-md transition-transform active:scale-95"
        >
          <Trash2 className="h-5 w-5" />
          Delete memory
        </button>

        <SecondaryButton href="/circle/memories">
          Back to memories
        </SecondaryButton>
      </div>
    </div>
  );
}
