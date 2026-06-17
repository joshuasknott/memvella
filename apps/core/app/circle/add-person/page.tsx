"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Camera, Check, Lightbulb, Loader2, Plus, Sparkles, X } from "lucide-react";
import type { Id } from "@memvella/backend/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import { FormCard } from "@/components/ui/FormCard";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { useCircleProfile } from "@/lib/use-circle-profile";

const RELATIONSHIP_OPTIONS = ["Son", "Daughter", "Grandchild", "Friend"];

export default function AddPersonPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading, isOrganiser, profile, seniorDisplayName } = useCircleProfile();
  const addPerson = useMutation(api.people.addPerson);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Son");
  const [isLiving, setIsLiving] = useState(true);
  const [aiContext, setAiContext] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customRelationship, setCustomRelationship] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const isFormValid = name.trim().length > 0 && relationship.trim().length > 0;

  const handleSavePerson = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      let photoStorageId: Id<"_storage"> | undefined;
      let uploadIntentId: Id<"uploadIntents"> | undefined;

      if (selectedPhoto) {
        const uploadResult = await uploadFileToConvex(
          generateUploadUrl,
          selectedPhoto,
          "image",
        );
        photoStorageId = uploadResult.storageId;
        uploadIntentId = uploadResult.uploadIntentId ?? undefined;
      }

      await addPerson({
        name: name.trim(),
        relationship,
        isLiving,
        aiContext: aiContext.trim(),
        photoStorageId,
        uploadIntentId,
      });

      toast({
        tone: "success",
        title: "Person saved",
        description: `${name.trim()} is now available in this Workspace.`,
      });
      router.push("/circle/people");
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Something went wrong. Please try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Person did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || profile === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-family-primary" />
        <p className="text-lg font-medium text-text-secondary">
          Loading People access...
        </p>
      </div>
    );
  }

  if (!isOrganiser) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-32">
        <div
          className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm"
          data-testid="add-person-restricted"
        >
          <p className="text-lg font-bold text-text-primary">
            Only Workspace owners can add People
          </p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            Supporters can view People context, but the Workspace owner manages these
            records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/circle/people")}
          className="flex h-[72px] w-full items-center justify-center rounded-full border-2 border-family-primary bg-surface px-6 text-lg font-semibold text-family-primary shadow-sm"
        >
          Back to People
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <section className="relative group mt-4">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          id="person-photo-input"
          onChange={handlePhotoSelect}
        />

        <label htmlFor="person-photo-input" className="block">
          <div className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface shadow-sm transition-colors hover:bg-surface-muted">
            {photoPreview ? (
              <>
                <Image
                  src={photoPreview}
                  alt="Photo preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    handleClearPhoto();
                  }}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <div className="relative z-10 mb-4 rounded-full bg-surface p-6 shadow-xl shadow-ambient transition-transform group-active:scale-90">
                  <Camera className="h-10 w-10 text-family-primary" strokeWidth={1.5} />
                </div>
                <p className="relative z-10 font-family text-lg font-bold text-family-primary">
                  Add Photo <span className="ml-1 text-sm font-normal italic text-text-secondary">(Optional)</span>
                </p>
                <p className="relative z-10 mt-1 text-sm italic text-text-secondary">
                  Make it a favorite memory
                </p>
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-family-primary/5 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
              </>
            )}
          </div>
        </label>
      </section>

      <FormCard as="section" className="space-y-8">
        <div className="space-y-6">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="person_name">
            What is their name?
          </label>
          <input
            id="person_name"
            placeholder="David"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            data-testid="person-name-input"
            className="h-12 w-full rounded-xl border border-border bg-surface px-6 text-lg transition-all focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/30"
          />
        </div>

        <div className="space-y-6">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary">
            Relationship to {seniorDisplayName}
          </label>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set([...RELATIONSHIP_OPTIONS, relationship])).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRelationship(option)}
                className={`flex h-12 items-center gap-2 rounded-full px-6 font-medium transition-colors ${
                  relationship === option
                    ? "bg-family-primary text-on-primary shadow-lg shadow-ambient"
                    : "bg-family-primary/10 text-text-secondary hover:bg-surface-muted"
                }`}
              >
                {relationship === option ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : null}
                {option}
              </button>
            ))}

            {isAddingCustom ? (
              <div className="flex h-12 items-center gap-2 rounded-full bg-surface-muted pl-4 pr-1">
                <input
                  type="text"
                  placeholder="Custom..."
                  value={customRelationship}
                  onChange={(event) => setCustomRelationship(event.target.value)}
                  data-testid="person-custom-relationship-input"
                  className="w-24 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customRelationship.trim()) {
                      setRelationship(customRelationship.trim());
                    }
                    setIsAddingCustom(false);
                    setCustomRelationship("");
                  }}
                  data-testid="person-custom-relationship-confirm"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-family-primary text-on-primary transition-colors hover:bg-family-primary/90"
                >
                  <Check className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-primary transition-colors hover:bg-surface-muted"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary">
            Status
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsLiving(true)}
              className={`h-14 flex-1 rounded-xl border-2 text-lg font-medium transition-all ${
                isLiving
                  ? "border-primary bg-family-primary/10 text-family-primary shadow-sm"
                  : "border-transparent bg-surface-muted text-text-secondary hover:bg-surface-muted/80"
              }`}
            >
              Living
            </button>
            <button
              type="button"
              onClick={() => setIsLiving(false)}
              className={`h-14 flex-1 rounded-xl border-2 text-lg font-medium transition-all ${
                !isLiving
                  ? "border-primary bg-family-primary/10 text-family-primary shadow-sm"
                  : "border-transparent bg-surface-muted text-text-secondary hover:bg-surface-muted/80"
              }`}
            >
              In Memory
            </button>
          </div>
          <p className="px-1 text-sm text-text-secondary">
            This helps Memvella speak about this person with the right context.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="ai_context">
              Key Facts and Context <span className="ml-2 text-sm font-normal italic text-text-secondary">(Optional)</span>
            </label>
            <Sparkles className="h-5 w-5 fill-family-primary/20 text-family-primary" />
          </div>
          <textarea
            id="ai_context"
            placeholder="E.g. David lives in Chicago and loves baseball."
            rows={4}
            value={aiContext}
            onChange={(event) => setAiContext(event.target.value)}
            data-testid="person-context-input"
            className="min-h-[120px] w-full resize-none rounded-xl border border-border bg-surface p-6 text-lg transition-all placeholder:text-text-secondary/50 focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/30"
          />
          <p className="px-1 text-sm text-text-secondary">
            What should Memvella know about them to help {seniorDisplayName} remember?
          </p>
        </div>
      </FormCard>

      <div className="group relative overflow-hidden rounded-xl bg-family-primary/10 p-6">
        <div className="relative z-10 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
            <Lightbulb className="h-6 w-6 text-family-primary" />
          </div>
          <div>
            <h4 className="font-family font-bold text-family-primary">
              People Context
            </h4>
            <p className="mt-1 text-sm leading-snug text-family-primary-variant">
              Adding context helps Memvella bring up the right memories during {seniorDisplayName}&apos;s wellness check-in.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 h-24 w-24 scale-150 rounded-full bg-family-primary/5 transition-transform duration-700 group-hover:scale-110" />
      </div>

      {error ? <p className="-mt-4 px-1 text-sm font-medium text-status-alert">{error}</p> : null}

      <button
        type="button"
        onClick={handleSavePerson}
        disabled={isSaving || !isFormValid}
        data-testid="person-save-button"
        className="mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-senior-primary text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Person"
        )}
      </button>
    </div>
  );
}
