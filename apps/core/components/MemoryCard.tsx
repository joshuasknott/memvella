import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileAudio, Film, Mic } from "lucide-react";

export interface MemoryCardRecord {
  id: string;
  title: string;
  summary: string;
  dateLabel: string;
  recordType: "text" | "media" | "audio" | "voice";
  previewAssetType?: string | null;
  previewUrl?: string | null;
}

export function MemoryCard({
  record,
  eager = false,
}: {
  record: MemoryCardRecord;
  eager?: boolean;
}) {
  const Icon = { text: BookOpen, media: Film, audio: FileAudio, voice: Mic }[
    record.recordType
  ];
  return (
    <Link
      href={`/circle/memories/${record.id}`}
      className="memory-card"
      data-testid="memory-list-item"
    >
      {record.previewAssetType === "image" && record.previewUrl ? (
        <div className="memory-card-image">
          <Image
            src={record.previewUrl}
            loading={eager ? "eager" : "lazy"}
            alt=""
            fill
            sizes="(min-width: 1100px) 30vw, (min-width: 640px) 45vw, 90vw"
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div className="memory-card-story">
          <Icon size={24} aria-hidden="true" />
          <p>{record.summary || record.title}</p>
        </div>
      )}
      <div className="memory-card-caption">
        <h3>{record.title}</h3>
        <p>{record.dateLabel}</p>
      </div>
    </Link>
  );
}
