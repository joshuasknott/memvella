"use client";

import Image from "next/image";
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
import { api } from "@memvella/backend";
import { PrimaryButton } from "@memvella/ui";
import { formatLastEditedLabel, formatMemoryRecordTypeLabel } from "@/lib/memory-record-ui";
import { useCircleProfile } from "@/lib/use-circle-profile";

const RECORD_ICON_MAP = {
  text: Type,
  media: Camera,
  audio: FileAudio2,
  voice: Mic,
} as const;

function MemorySkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="h-24 w-24 rounded-xl bg-surface-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-20 rounded bg-surface-muted" />
          <div className="h-6 w-40 rounded bg-surface-muted" />
          <div className="h-4 w-full rounded bg-surface-muted" />
          <div className="h-4 w-2/3 rounded bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

export default function OrganiserMemoriesPage() {
  const { seniorDisplayName } = useCircleProfile();
  const memoryRecords = useQuery(api.memories.listMemoryRecords);

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-6">
      <section className="rounded-xl border border-family-accent/15 bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-accent">
              Memory Library
            </p>
            <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
              Memories
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">
              Review, edit, and organize the stories, photos, voice notes, and recordings that shape {seniorDisplayName}&apos;s companion.
            </p>
          </div>
          <Link
            href="/circle/add-memory"
            className="inline-flex min-h-[56px] shrink-0 items-center justify-center rounded-full bg-senior-primary px-5 text-base font-semibold text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add
          </Link>
        </div>

        <div className="mt-5 inline-flex rounded-full bg-family-primary/10 px-4 py-2 text-sm font-semibold text-family-primary">
          {memoryRecords === undefined ? "Loading memories..." : `${memoryRecords.length} record${memoryRecords.length === 1 ? "" : "s"} in this Workspace`}
        </div>
      </section>

      {memoryRecords === undefined ? (
        <div className="space-y-3">
          <MemorySkeleton />
          <MemorySkeleton />
          <MemorySkeleton />
        </div>
      ) : memoryRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-16 items-center justify-center rounded-xl bg-family-accent/10 text-family-accent">
            <ImageIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-lg font-bold text-text-primary">No memories yet</p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            Add the first record so the Workspace and companion gallery have meaningful moments to surface.
          </p>
          <div className="mt-6">
            <PrimaryButton href="/circle/add-memory">
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
                href={`/circle/memories/${record.id}`}
                className="block rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-family-primary/20"
              >
                <div className="flex gap-4">
                  {record.previewAssetType === "image" && record.previewUrl ? (
                    <Image
                      src={record.previewUrl}
                      alt={record.title}
                      width={96}
                      height={96}
                      unoptimized
                      className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
                      <Icon className="h-8 w-8" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-family-accent">
                          {formatMemoryRecordTypeLabel(record.recordType)}
                        </p>
                        <p className="mt-1 text-lg font-bold leading-tight text-text-primary">
                          {record.title}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" />
                    </div>

                    <p className="mt-2 text-base leading-relaxed text-text-secondary">
                      {record.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-family-accent/10 px-3 py-2 text-sm font-semibold text-family-accent">
                        {record.dateLabel}
                      </span>
                      <span className="rounded-full bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
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
        <PrimaryButton href="/circle/add-memory">
          Add another memory
        </PrimaryButton>
      ) : null}
    </div>
  );
}
