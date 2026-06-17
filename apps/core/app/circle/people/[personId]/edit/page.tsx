"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Camera, Check, Loader2, Plus, Upload, X } from "lucide-react";
import type { Id } from "@memvella/backend/dataModel";
import { api } from "@memvella/backend";
import { PrimaryButton, SecondaryButton, TextInput } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";
import { useToast } from "@/components/ui/ToastProvider";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { useCircleProfile } from "@/lib/use-circle-profile";

const RELATIONSHIP_OPTIONS = ["Son", "Daughter", "Grandchild", "Friend"];

export default function EditPersonPage() {
  const params = useParams<{ personId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading, isOrganiser, profile, seniorDisplayName } = useCircleProfile();
  const personId = params.personId as Id<"people">;
  const person = useQuery(
    api.people.getPersonDetail,
    profile !== undefined && isOrganiser ? { personId } : "skip",
  );
  const updatePerson = useMutation(api.people.updatePerson);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Son");
  const [isLiving, setIsLiving] = useState(true);
  const [aiContext, setAiContext] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customRelationship, setCustomRelationship] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!person) {
      return;
    }

    setName(person.name);
    setRelationship(person.relationship);
    setIsLiving(person.isLiving);
    setAiContext(person.aiContext);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setRemovePhoto(false);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }, [person]);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreview(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedPhoto);
    setPhotoPreview(nextUrl);
    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [selectedPhoto]);

  const isFormValid = name.trim().length > 0 && relationship.trim().length > 0;
  const visiblePhotoUrl = photoPreview ?? (!removePhoto ? person?.photoUrl ?? null : null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedPhoto(file);
    setRemovePhoto(false);
  };

  const handleClearNewPhoto = () => {
    setSelectedPhoto(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const handleSavePerson = async () => {
    if (!person || !isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      let replacePhotoStorageId: Id<"_storage"> | undefined;
      let uploadIntentId: Id<"uploadIntents"> | undefined;

      if (selectedPhoto) {
        const uploadResult = await uploadFileToConvex(
          generateUploadUrl,
          selectedPhoto,
          "image",
        );
        replacePhotoStorageId = uploadResult.storageId;
        uploadIntentId = uploadResult.uploadIntentId ?? undefined;
      }

      await updatePerson({
        personId,
        name: name.trim(),
        relationship: relationship.trim(),
        isLiving,
        aiContext: aiContext.trim(),
        replacePhotoStorageId,
        removePhoto: removePhoto && !selectedPhoto ? true : undefined,
        uploadIntentId,
      });

      toast({
        tone: "success",
        title: "Person updated",
        description: `${name.trim()} was updated in People context.`,
      });
      router.push(`/circle/people/${personId}`);
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save these changes. Please try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Person changes did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || profile === undefined || (isOrganiser && person === undefined)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-family-primary" />
        <p className="text-lg font-medium text-text-secondary">
          Loading this Person...
        </p>
      </div>
    );
  }

  if (!isOrganiser) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-32">
        <div
          className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm"
          data-testid="people-edit-restricted"
        >
          <p className="text-lg font-bold text-text-primary">
            Only Workspace owners can edit People
          </p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            People are visible to Supporters, but changes are managed by the
            Workspace owner.
          </p>
        </div>
        <SecondaryButton href="/circle/people">Back to People</SecondaryButton>
      </div>
    );
  }

  if (person === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-family-primary" />
        <p className="text-lg font-medium text-text-secondary">
          Loading this Person...
        </p>
      </div>
    );
  }

  if (person === null) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-32">
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-text-primary">Person not found</p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            This Person is no longer available in the current Workspace.
          </p>
        </div>
        <SecondaryButton href="/circle/people">Back to People</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col justify-between px-4 pb-32">
      <div className="space-y-6">
        <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
            Edit Person
          </p>
          <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
            {person.name}
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            Keep People context accurate for memories and voice conversations
            with {seniorDisplayName}.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="person-photo-input"
            onChange={handlePhotoSelect}
          />

          <div className="overflow-hidden rounded-xl border border-border bg-surface-muted">
            {visiblePhotoUrl ? (
              <div className="relative h-56 w-full">
                <Image
                  src={visiblePhotoUrl}
                  alt={name || person.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-family-primary">
                <Camera className="h-10 w-10" />
                <p className="text-base font-semibold">No photo attached</p>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <label htmlFor="person-photo-input" className="block">
              <div className="flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-family-accent px-6 text-base font-semibold text-white shadow-md transition-transform active:scale-95">
                <Upload className="h-5 w-5" />
                {visiblePhotoUrl ? "Choose replacement photo" : "Choose photo"}
              </div>
            </label>

            {selectedPhoto ? (
              <button
                type="button"
                onClick={handleClearNewPhoto}
                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-surface-muted px-6 text-base font-semibold text-text-secondary"
              >
                <X className="h-5 w-5" />
                Discard new photo
              </button>
            ) : person.photoUrl && !removePhoto ? (
              <button
                type="button"
                onClick={() => setRemovePhoto(true)}
                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-red-50 px-6 text-base font-semibold text-red-700"
              >
                <X className="h-5 w-5" />
                Remove current photo
              </button>
            ) : null}
          </div>
        </section>

        <FormCard as="section" className="space-y-8">
          <div className="space-y-3">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="person_name">
              Name
            </label>
            <TextInput
              id="person_name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              data-testid="person-edit-name-input"
            />
          </div>

          <div className="space-y-4">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary">
              Relationship
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
                    className="w-28 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                    data-testid="person-edit-custom-relationship-input"
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
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-family-primary text-on-primary transition-colors hover:bg-family-primary/90"
                    data-testid="person-edit-custom-relationship-confirm"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-primary transition-colors hover:bg-surface-muted"
                  aria-label="Add custom relationship"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
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
          </div>

          <div className="space-y-3">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="ai_context">
              Key facts and context
            </label>
            <textarea
              id="ai_context"
              rows={5}
              value={aiContext}
              onChange={(event) => setAiContext(event.target.value)}
              className="min-h-[140px] w-full resize-none rounded-xl border-2 border-border bg-surface p-6 text-lg text-text-primary shadow-sm outline-none transition-all placeholder:text-text-secondary focus:border-family-primary focus:ring-2 focus:ring-family-primary/20"
              data-testid="person-edit-context-input"
            />
          </div>
        </FormCard>
      </div>

      <div className="mt-8 space-y-3">
        {error ? <p className="px-1 text-sm font-medium text-status-alert">{error}</p> : null}

        <PrimaryButton
          onClick={handleSavePerson}
          disabled={isSaving || !isFormValid}
          data-testid="person-edit-save-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              {selectedPhoto ? "Uploading and saving..." : "Saving changes..."}
            </>
          ) : (
            "Save changes"
          )}
        </PrimaryButton>

        <SecondaryButton href={`/circle/people/${personId}`}>
          Back to Person
        </SecondaryButton>
      </div>
    </div>
  );
}
