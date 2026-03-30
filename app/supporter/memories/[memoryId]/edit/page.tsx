"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Upload, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { inferMemoryAssetType, uploadFileToConvex } from "@/lib/convex-upload";
import { formatMemoryRecordTypeLabel } from "@/lib/memory-record-ui";

type VisibleAsset = {
  assetType: "image" | "video" | "audio";
  resolvedUrl: string;
  fileName: string | null;
};

function AssetPreview({
  asset,
  title,
}: {
  asset: VisibleAsset;
  title: string;
}) {
  if (asset.assetType === "image") {
    return (
      <img
        src={asset.resolvedUrl}
        alt={asset.fileName ?? title}
        className="h-64 w-full rounded-3xl object-cover"
      />
    );
  }

  if (asset.assetType === "video") {
    return <video controls src={asset.resolvedUrl} className="w-full rounded-3xl" />;
  }

  return <audio controls src={asset.resolvedUrl} className="w-full" />;
}

export default function SupporterMemoryEditPage() {
  const params = useParams<{ memoryId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const memoryRecordId = params.memoryId as Id<"memoryRecords">;
  const memoryDetail = useQuery(api.memories.getMemoryRecordDetail, { memoryRecordId });
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);
  const updateTextMemory = useMutation(api.memories.updateTextMemory);
  const updateAudioMemory = useMutation(api.memories.updateAudioMemory);
  const updateVoiceMemory = useMutation(api.memories.updateVoiceMemory);
  const updateMediaMemory = useMutation(api.memories.updateMediaMemory);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [story, setStory] = useState("");
  const [transcript, setTranscript] = useState("");
  const [songLink, setSongLink] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [removeCurrentAsset, setRemoveCurrentAsset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memoryDetail) {
      return;
    }

    setTitle(memoryDetail.title);
    setDate(memoryDetail.memoryDate ?? "");
    setStory(memoryDetail.story ?? "");
    setTranscript(memoryDetail.transcript ?? "");
    setSongLink(memoryDetail.externalUrl ?? "");
    setSelectedFile(null);
    setRemoveCurrentAsset(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [memoryDetail]);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFileUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setSelectedFileUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [selectedFile]);

  const currentAsset = memoryDetail?.assets[0] ?? null;
  const fileAssetType = selectedFile ? inferMemoryAssetType(selectedFile) : null;

  const visibleAsset = useMemo<VisibleAsset | null>(() => {
    if (selectedFile && selectedFileUrl && fileAssetType) {
      return {
        assetType: fileAssetType,
        resolvedUrl: selectedFileUrl,
        fileName: selectedFile.name,
      };
    }

    if (!removeCurrentAsset && currentAsset?.resolvedUrl) {
      return {
        assetType: currentAsset.assetType,
        resolvedUrl: currentAsset.resolvedUrl,
        fileName: currentAsset.fileName,
      };
    }

    return null;
  }, [currentAsset, fileAssetType, removeCurrentAsset, selectedFile, selectedFileUrl]);

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
            This record is no longer available in the current FamilySpace.
          </p>
        </div>
        <SecondaryButton href="/supporter/memories">
          Back to memories
        </SecondaryButton>
      </div>
    );
  }

  const acceptsFiles =
    memoryDetail.recordType === "text"
      ? "image/*"
      : memoryDetail.recordType === "media"
        ? "image/*,video/*"
        : memoryDetail.recordType === "audio"
          ? "audio/*"
          : null;

  const isFormValid =
    memoryDetail.recordType === "voice"
      ? title.trim().length > 0 && transcript.trim().length > 0
      : memoryDetail.recordType === "media"
        ? title.trim().length > 0
        : title.trim().length > 0 && story.trim().length > 0;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedFile(nextFile);
    setRemoveCurrentAsset(false);
  };

  const discardNewFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const uploadKind =
        selectedFile && memoryDetail.recordType === "media"
          ? inferMemoryAssetType(selectedFile) === "video"
            ? "video"
            : "image"
          : selectedFile && memoryDetail.recordType === "audio"
            ? "audio"
            : selectedFile
              ? "image"
              : undefined;
      const uploadedStorageId = selectedFile
        ? await uploadFileToConvex(generateUploadUrl, selectedFile, uploadKind)
        : undefined;

      switch (memoryDetail.recordType) {
        case "text":
          await updateTextMemory({
            memoryRecordId,
            title: title.trim(),
            date: date.trim() || undefined,
            story: story.trim(),
            replacePhotoStorageId: uploadedStorageId,
            replacePhotoMimeType: selectedFile?.type || undefined,
            replacePhotoFileName: selectedFile?.name || undefined,
            removePhoto: removeCurrentAsset && !selectedFile ? true : undefined,
          });
          break;
        case "audio":
          await updateAudioMemory({
            memoryRecordId,
            title: title.trim(),
            date: date.trim() || undefined,
            story: story.trim(),
            songLink: songLink.trim() || undefined,
            replaceAudioStorageId: uploadedStorageId,
            replaceAudioMimeType: selectedFile?.type || undefined,
            replaceAudioFileName: selectedFile?.name || undefined,
            removeAudio: removeCurrentAsset && !selectedFile ? true : undefined,
          });
          break;
        case "voice":
          await updateVoiceMemory({
            memoryRecordId,
            title: title.trim(),
            date: date.trim() || undefined,
            transcript: transcript.trim(),
          });
          break;
        case "media":
          await updateMediaMemory({
            memoryRecordId,
            title: title.trim(),
            date: date.trim() || undefined,
            story: story.trim(),
            replaceMediaStorageId: uploadedStorageId,
            replaceMediaMimeType: selectedFile?.type || undefined,
            replaceMediaFileName: selectedFile?.name || undefined,
            replaceMediaAssetType:
              selectedFile && inferMemoryAssetType(selectedFile) === "video"
                ? "video"
                : selectedFile
                  ? "image"
                  : undefined,
            removeMedia: removeCurrentAsset && !selectedFile ? true : undefined,
          });
          break;
      }

      toast({
        tone: "success",
        title: "Memory updated",
        description: `${title.trim()} was updated in the FamilySpace.`,
      });
      router.push(`/supporter/memories/${memoryRecordId}`);
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save these changes. Please try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Memory changes did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col justify-between px-4 pb-32">
      <div className="space-y-6">
        <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-800">
            Edit {formatMemoryRecordTypeLabel(memoryDetail.recordType)}
          </p>
          <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
            {memoryDetail.title}
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-gray-600">
            Keep this FamilySpace record accurate and easy to revisit.
          </p>
        </section>

        <FormCard as="section" className="space-y-8">
          <div className="space-y-3">
            <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="memory_title">
              Title
            </label>
            <TextInput
              id="memory_title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="memory_date">
              Date <span className="ml-2 text-sm font-normal italic text-gray-500">(Optional)</span>
            </label>
            <TextInput
              id="memory_date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          {memoryDetail.recordType === "audio" ? (
            <div className="space-y-3">
              <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="memory_link">
                Link <span className="ml-2 text-sm font-normal italic text-gray-500">(Optional)</span>
              </label>
              <TextInput
                id="memory_link"
                type="url"
                value={songLink}
                onChange={(event) => setSongLink(event.target.value)}
                placeholder="Spotify, Apple Music, or another audio link"
              />
            </div>
          ) : null}

          {memoryDetail.recordType === "voice" ? (
            <div className="space-y-3">
              <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="memory_transcript">
                Transcript
              </label>
              <textarea
                id="memory_transcript"
                rows={6}
                required
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                className="min-h-[160px] w-full resize-none rounded-3xl border-2 border-gray-200 bg-white p-6 text-lg text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-purple-800 focus:ring-2 focus:ring-purple-800/20"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="memory_story">
                {memoryDetail.recordType === "media" ? "Story" : "Details"}
              </label>
              <textarea
                id="memory_story"
                rows={6}
                required={memoryDetail.recordType !== "media"}
                value={story}
                onChange={(event) => setStory(event.target.value)}
                className="min-h-[160px] w-full resize-none rounded-3xl border-2 border-gray-200 bg-white p-6 text-lg text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-purple-800 focus:ring-2 focus:ring-purple-800/20"
              />
            </div>
          )}
        </FormCard>

        {acceptsFiles ? (
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold text-gray-900">
                  Asset
                </h2>
                <p className="mt-2 text-base leading-relaxed text-gray-500">
                  Replace or remove the primary file attached to this memory.
                </p>
              </div>
            </div>

            {visibleAsset ? (
              <div className="mt-5 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 p-3">
                <AssetPreview asset={visibleAsset} title={title || memoryDetail.title} />
              </div>
            ) : removeCurrentAsset ? (
              <div className="mt-5 rounded-3xl bg-red-50 p-4 text-base font-medium text-red-700">
                The current asset will be removed when you save.
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-gray-50 p-4 text-base font-medium text-gray-500">
                No asset attached.
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptsFiles}
              className="hidden"
              id="memory_asset_input"
              onChange={handleFileSelect}
            />

            <div className="mt-5 space-y-3">
              <label htmlFor="memory_asset_input" className="block">
                <div className="flex min-h-[72px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-lg font-semibold text-white shadow-md transition-transform active:scale-95">
                  <Upload className="h-6 w-6" />
                  {currentAsset || selectedFile ? "Choose replacement file" : "Choose file"}
                </div>
              </label>

              {selectedFile ? (
                <button
                  type="button"
                  onClick={discardNewFile}
                  className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-gray-100 px-6 text-base font-semibold text-gray-700"
                >
                  <X className="h-5 w-5" />
                  Discard new file
                </button>
              ) : currentAsset && !removeCurrentAsset ? (
                <button
                  type="button"
                  onClick={() => setRemoveCurrentAsset(true)}
                  className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-red-50 px-6 text-base font-semibold text-red-700"
                >
                  <X className="h-5 w-5" />
                  Remove current asset
                </button>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-8 space-y-3">
        {error ? <p className="px-1 text-sm font-medium text-red-600">{error}</p> : null}

        <PrimaryButton onClick={handleSave} disabled={isSaving || !isFormValid}>
          {isSaving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              {selectedFile ? "Uploading and saving..." : "Saving changes..."}
            </>
          ) : (
            "Save changes"
          )}
        </PrimaryButton>

        <SecondaryButton href={`/supporter/memories/${memoryRecordId}`}>
          Back to memory
        </SecondaryButton>
      </div>
    </div>
  );
}
