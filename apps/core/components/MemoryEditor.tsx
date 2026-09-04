"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Camera, Mic, Square, X, Loader2, Music } from "lucide-react";
import { api } from "@memvella/backend";
import { useToast } from "@/components/ui/ToastProvider";
import { useCircleProfile } from "@/lib/use-circle-profile";
import { useMemoryDictation } from "@/lib/use-memory-dictation";
import {
  inferMemoryAssetType,
  uploadFileToConvex,
  validateUploadFile,
} from "@/lib/convex-upload";

type Mode = "text" | "media" | "audio" | "voice";

export default function MemoryEditor({
  initialMode = "text",
}: {
  initialMode?: Mode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName, isAuthenticated, profile } = useCircleProfile();
  const addText = useMutation(api.memories.addMemoryText);
  const addMedia = useMutation(api.memories.addMemoryMedia);
  const addAudio = useMutation(api.memories.addMemoryAudio);
  const addVoice = useMutation(api.memories.addMemoryVoice);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [date, setDate] = useState("");
  const [songLink, setSongLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [audioDetails, setAudioDetails] = useState(initialMode === "audio");
  const [dictated, setDictated] = useState(initialMode === "voice");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dictation = useMemoryDictation(setStory, setError);
  const fileKind = file ? inferMemoryAssetType(file) : null;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    try {
      validateUploadFile(selected, inferMemoryAssetType(selected));
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
      if (selected.type.startsWith("audio/")) setAudioDetails(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Choose a supported file.",
      );
      event.target.value = "";
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      isSaving ||
      !isAuthenticated ||
      !profile ||
      dictation.isRecording ||
      dictation.isStarting
    )
      return;
    if (!title.trim() || (!story.trim() && !file)) {
      setError(
        "Add a title, then a few words or a photo, video, or recording.",
      );
      return;
    }
    const isAudioMemory =
      fileKind === "audio" ||
      !!songLink.trim() ||
      (initialMode === "audio" && !file);
    if (songLink.trim() && file && fileKind !== "audio") {
      setError(
        "Save the song link with a story or audio recording. Remove the photo or video, or clear the link.",
      );
      return;
    }
    if (isAudioMemory && !story.trim()) {
      setError("Add a few words about the recording before saving.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const base = {
        title: title.trim(),
        date: date || undefined,
        story: story.trim(),
      };
      const uploaded = file
        ? await uploadFileToConvex(generateUploadUrl, file, fileKind!)
        : undefined;
      if (file && (fileKind === "image" || fileKind === "video") && uploaded) {
        await addMedia({
          ...base,
          mediaStorageId: uploaded.storageId,
          mediaAssetType: fileKind,
          mediaMimeType: file.type,
          mediaFileName: file.name,
          uploadIntentId: uploaded.uploadIntentId ?? undefined,
        });
      } else if (isAudioMemory) {
        await addAudio({
          ...base,
          songLink: songLink.trim() || undefined,
          audioStorageId: uploaded?.storageId,
          audioMimeType: file?.type,
          audioFileName: file?.name,
          uploadIntentId: uploaded?.uploadIntentId ?? undefined,
        });
      } else if (dictated) {
        await addVoice({
          title: base.title,
          date: base.date,
          transcript: base.story,
        });
      } else {
        await addText(base);
      }
      toast({
        tone: "success",
        title: "Memory saved",
        description: title.trim(),
      });
      router.push("/circle/memories");
    } catch {
      setError(
        "Your memory couldn’t save. Check your connection and try again.",
      );
      setIsSaving(false);
    }
  }

  return (
    <div className="memory-editor">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Something worth keeping</p>
          <h1>Add a memory</h1>
          <p>A moment for {seniorDisplayName} to come back to.</p>
        </div>
      </section>
      <form onSubmit={save} aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="contents">
          <div>
            <label htmlFor="memory-title">Give it a name</label>
            <input
              id="memory-title"
              data-testid={`${initialMode}-memory-title-input`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A day by the sea"
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="memory-story">
              The story{" "}
              <span className="optional">
                {file && fileKind !== "audio" ? "(optional)" : ""}
              </span>
            </label>
            <textarea
              id="memory-story"
              data-testid={
                initialMode === "voice"
                  ? "voice-memory-transcript-input"
                  : `${initialMode}-memory-story-input`
              }
              value={story}
              onChange={(event) => setStory(event.target.value)}
              readOnly={dictation.isRecording || dictation.isStarting}
              placeholder="Who was there? What made it special?"
              rows={5}
              aria-describedby="story-help"
            />
            <p id="story-help" className="editor-help">
              Write a few words, or use the microphone to speak them. You can
              edit before saving.
            </p>
          </div>
          <div className="editor-tools">
            <button type="button" onClick={() => fileInput.current?.click()}>
              <Camera size={20} aria-hidden="true" /> Add photo or file
            </button>
            <button
              type="button"
              data-testid="voice-memory-record-button"
              aria-pressed={dictation.isRecording || dictation.isStarting}
              disabled={dictation.isStarting}
              onClick={() => {
                if (dictation.isRecording) dictation.stop();
                else {
                  setError(null);
                  setDictated(true);
                  dictation.start(story);
                }
              }}
            >
              {dictation.isRecording ? (
                <Square size={18} aria-hidden="true" />
              ) : (
                <Mic size={20} aria-hidden="true" />
              )}
              {dictation.isStarting
                ? "Starting…"
                : dictation.isRecording
                  ? "Stop dictation"
                  : "Speak instead"}
            </button>
            <button
              type="button"
              aria-expanded={audioDetails}
              onClick={() => setAudioDetails(!audioDetails)}
            >
              <Music size={20} aria-hidden="true" /> Song link
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-label="Add a memory file"
            accept="image/*,video/*,audio/*"
            data-testid={`${initialMode}-memory-file-input`}
            onChange={selectFile}
          />
          {file ? (
            <figure className="editor-preview">
              {preview && fileKind === "image" ? (
                <Image
                  src={preview}
                  alt="Selected photo preview"
                  width={700}
                  height={400}
                  unoptimized
                />
              ) : preview && fileKind === "video" ? (
                <video
                  src={preview}
                  controls
                  aria-label="Selected video preview"
                />
              ) : preview && fileKind === "audio" ? (
                <audio
                  src={preview}
                  controls
                  aria-label="Selected audio preview"
                  className="w-full p-3"
                />
              ) : null}
              <figcaption>
                <span>{file.name}</span>
                <button
                  type="button"
                  aria-label="Remove attachment"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                >
                  <X size={20} />
                </button>
              </figcaption>
            </figure>
          ) : null}
          {audioDetails ? (
            <div>
              <label htmlFor="song-link">
                Link to a song <span className="optional">(optional)</span>
              </label>
              <input
                type="url"
                id="song-link"
                data-testid="audio-memory-link-input"
                placeholder="https://…"
                value={songLink}
                onChange={(event) => setSongLink(event.target.value)}
              />
              <p className="editor-help">
                A link is saved with your story. It won’t play automatically.
              </p>
            </div>
          ) : null}
          <div>
            <label htmlFor="memory-date">
              When was it? <span className="optional">(optional)</span>
            </label>
            <input
              type="date"
              id="memory-date"
              data-testid={`${initialMode}-memory-date-input`}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </fieldset>
        {error ? (
          <p role="alert" className="form-error">
            {error}
          </p>
        ) : null}
        <div className="editor-footer">
          <Link className="quiet-link" href="/circle/memories">
            Cancel
          </Link>
          <button
            type="submit"
            data-testid={`${initialMode}-memory-save-button`}
            className="action-button"
            disabled={
              isSaving ||
              !isAuthenticated ||
              !profile ||
              dictation.isRecording ||
              dictation.isStarting
            }
          >
            {isSaving ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                  aria-hidden="true"
                />{" "}
                Saving…
              </>
            ) : (
              "Save memory"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
