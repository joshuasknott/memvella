"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  Camera,
  ChevronRight,
  FileAudio2,
  ImageIcon,
  Mic,
  Plus,
  Type,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { PrimaryButton } from "@/components/ui/Button";
import { formatLastEditedLabel, formatMemoryRecordTypeLabel } from "@/lib/memory-record-ui";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

const RECORD_ICON_MAP = {
  text: Type,
  media: Camera,
  audio: FileAudio2,
  voice: Mic,
} as const;

function MemorySkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="h-24 w-24 rounded-3xl bg-gray-100" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-6 w-40 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function SupporterMemoriesPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();
  const memoryRecords = useQuery(api.memories.listMemoryRecords);

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-6">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
              Memory Library
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              Memories
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-gray-600">
              Review, edit, and organize the stories, photos, voice notes, and recordings that shape {seniorDisplayName}&apos;s FamilySpace.
            </p>
          </div>
          <Link
            href="/supporter/add-memory"
            className="inline-flex min-h-[56px] shrink-0 items-center justify-center rounded-full bg-[#6B21A8] px-5 text-base font-semibold text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add
          </Link>
        </div>

        <div className="mt-5 inline-flex rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-800">
          {memoryRecords === undefined ? "Loading memories..." : `${memoryRecords.length} record${memoryRecords.length === 1 ? "" : "s"} in this FamilySpace`}
        </div>
      </section>

      {memoryRecords === undefined ? (
        <div className="space-y-3">
          <MemorySkeleton />
          <MemorySkeleton />
          <MemorySkeleton />
        </div>
      ) : memoryRecords.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-800">
            <ImageIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-xl font-bold text-gray-900">No memories yet</p>
          <p className="mt-2 text-lg leading-relaxed text-gray-500">
            Add the first record so the Supporter dashboard and Senior gallery have meaningful moments to surface.
          </p>
          <div className="mt-6">
            <PrimaryButton href="/supporter/add-memory">
              Add the first memory
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {memoryRecords.map((record) => {
            const Icon = RECORD_ICON_MAP[record.recordType];

            return (
              <Link
                key={record.id}
                href={`/supporter/memories/${record.id}`}
                className="block rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-purple-200"
              >
                <div className="flex gap-4">
                  {record.previewAssetType === "image" && record.previewUrl ? (
                    <img
                      src={record.previewUrl}
                      alt={record.title}
                      className="h-24 w-24 shrink-0 rounded-3xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-purple-50 text-purple-800">
                      <Icon className="h-8 w-8" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-800">
                          {formatMemoryRecordTypeLabel(record.recordType)}
                        </p>
                        <p className="mt-1 text-2xl font-bold leading-tight text-gray-900">
                          {record.title}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                    </div>

                    <p className="mt-2 text-base leading-relaxed text-gray-600">
                      {record.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                        {record.dateLabel}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600">
                        Updated {formatLastEditedLabel(record.lastEditedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {memoryRecords && memoryRecords.length > 0 ? (
        <PrimaryButton href="/supporter/add-memory">
          Add another memory
        </PrimaryButton>
      ) : null}
    </div>
  );
}
