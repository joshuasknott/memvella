"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Camera, Check, Lightbulb, Loader2, Plus, Sparkles, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { FormCard } from "@/components/ui/FormCard";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

const RELATIONSHIP_OPTIONS = ["Son", "Daughter", "Grandchild", "Friend"];

export default function AddPersonPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName } = useFamilySpaceProfile();
  const addFamilyMember = useMutation(api.supporter.addFamilyMember);
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

      if (selectedPhoto) {
        photoStorageId = await uploadFileToConvex(
          generateUploadUrl,
          selectedPhoto,
          "image",
        );
      }

      await addFamilyMember({
        name: name.trim(),
        relationship,
        isLiving,
        aiContext: aiContext.trim(),
        photoStorageId,
      });

      toast({
        tone: "success",
        title: "Connection saved",
        description: `${name.trim()} is now available in this FamilySpace.`,
      });
      router.push("/supporter/memories");
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Something went wrong. Please try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Connection did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low shadow-sm transition-colors hover:bg-surface-container-high">
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Photo preview" className="h-full w-full object-cover" />
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
                <div className="relative z-10 mb-4 rounded-full bg-white p-6 shadow-xl shadow-primary/5 transition-transform group-active:scale-90">
                  <Camera className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <p className="relative z-10 font-headline text-xl font-bold text-primary">
                  Add Photo <span className="ml-1 text-sm font-normal italic text-outline">(Optional)</span>
                </p>
                <p className="relative z-10 mt-1 text-sm italic text-outline">
                  Make it a favorite memory
                </p>
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
              </>
            )}
          </div>
        </label>
      </section>

      <FormCard as="section" className="space-y-8">
        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="person_name">
            What is their name?
          </label>
          <input
            id="person_name"
            placeholder="David"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-16 w-full rounded-2xl border border-gray-200 bg-white px-6 text-lg transition-all focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
        </div>

        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface">
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
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "bg-secondary-fixed text-on-secondary-container hover:bg-secondary-container/30"
                }`}
              >
                {relationship === option ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : null}
                {option}
              </button>
            ))}

            {isAddingCustom ? (
              <div className="flex h-12 items-center gap-2 rounded-full bg-surface-container-high pl-4 pr-1">
                <input
                  type="text"
                  placeholder="Custom..."
                  value={customRelationship}
                  onChange={(event) => setCustomRelationship(event.target.value)}
                  className="w-24 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-outline-variant"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary/90"
                >
                  <Check className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-surface-container-highest"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Status
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsLiving(true)}
              className={`h-14 flex-1 rounded-2xl border-2 text-lg font-medium transition-all ${
                isLiving
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-transparent bg-surface-container-highest text-outline hover:bg-surface-container-highest/80"
              }`}
            >
              Living
            </button>
            <button
              type="button"
              onClick={() => setIsLiving(false)}
              className={`h-14 flex-1 rounded-2xl border-2 text-lg font-medium transition-all ${
                !isLiving
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-transparent bg-surface-container-highest text-outline hover:bg-surface-container-highest/80"
              }`}
            >
              In Memory
            </button>
          </div>
          <p className="px-1 text-sm text-outline">
            This helps Memvella speak about this connection with the right context.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="ai_context">
              Key Facts and Context <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
            </label>
            <Sparkles className="h-5 w-5 fill-primary/20 text-primary" />
          </div>
          <textarea
            id="ai_context"
            placeholder="E.g. David lives in Chicago and loves baseball."
            rows={4}
            value={aiContext}
            onChange={(event) => setAiContext(event.target.value)}
            className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-200 bg-white p-6 text-lg transition-all placeholder:text-outline/50 focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
          <p className="px-1 text-sm text-outline">
            What should Memvella know about them to help {seniorDisplayName} remember?
          </p>
        </div>
      </FormCard>

      <div className="group relative overflow-hidden rounded-3xl bg-primary-fixed/30 p-6">
        <div className="relative z-10 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">
              Family Connections
            </h4>
            <p className="mt-1 text-sm leading-snug text-on-primary-fixed-variant">
              Adding context helps Memvella bring up the right memories during {seniorDisplayName}&apos;s wellness check-in.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 h-24 w-24 scale-150 rounded-full bg-primary/5 transition-transform duration-700 group-hover:scale-110" />
      </div>

      {error ? <p className="-mt-4 px-1 text-sm font-medium text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleSavePerson}
        disabled={isSaving || !isFormValid}
        className="mb-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#6B21A8] text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Connection"
        )}
      </button>
    </div>
  );
}
