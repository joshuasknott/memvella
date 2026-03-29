"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Camera, Check, Plus, Sparkles, Lightbulb, Loader2, X } from 'lucide-react';

const RELATIONSHIP_OPTIONS = ['Son', 'Daughter', 'Grandchild', 'Friend'];

export default function AddPersonPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.caregiver.getCaregiverProfile, isAuthenticated ? undefined : "skip");
  const addFamilyMember = useMutation(api.caregiver.addFamilyMember);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const lovedOneName = profile?.lovedOneName || 'your loved one';

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Son');
  const [isLiving, setIsLiving] = useState(true);
  const [aiContext, setAiContext] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom relationship state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customRelText, setCustomRelText] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSavePerson = async () => {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    if (!aiContext.trim()) {
      setError('Please add some context for Memvella.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      let photoStorageId: Id<'_storage'> | undefined = undefined;

      // 3-step Convex upload if a photo was selected
      if (selectedPhoto) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedPhoto.type },
          body: selectedPhoto,
        });
        if (!result.ok) throw new Error('Photo upload failed.');
        const { storageId } = await result.json() as { storageId: Id<'_storage'> };
        photoStorageId = storageId;
      }

      await addFamilyMember({
        name: name.trim(),
        relationship,
        isLiving,
        aiContext: aiContext.trim(),
        photoStorageId,
      });
      router.push('/caregiver/memories');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Photo Upload Hero */}
      <section className="relative group">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          id="person-photo-input"
          onChange={handlePhotoSelect}
        />
        <label htmlFor="person-photo-input" className="block">
          <div className="w-full h-40 rounded-lg bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden shadow-sm relative">
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Photo preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleClearPhoto(); }}
                  className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-full shadow-xl shadow-primary/5 mb-4 group-active:scale-90 transition-transform">
                  <Camera className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
                <p className="font-headline font-bold text-lg text-primary">Add Photo</p>
                <p className="text-sm text-outline mt-1 font-light italic">Make it a favorite memory</p>
                {/* Decorative tonal bleed */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
              </>
            )}
          </div>
        </label>
      </section>

      {/* Form Essentials */}
      <section className="space-y-8">
        {/* Name Input */}
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="person_name">What is their name?</label>
          <div className="relative">
            <input
              id="person_name"
              placeholder="David"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
            />
          </div>
        </div>

        {/* Relationship Dropdown/Pill-Selector */}
        <div className="space-y-4">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight">Relationship to {lovedOneName}</label>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set([...RELATIONSHIP_OPTIONS, relationship])).map((option) => (
              <button
                key={option}
                onClick={() => setRelationship(option)}
                className={`h-12 px-6 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  relationship === option
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-secondary-fixed text-on-secondary-container hover:bg-secondary-container/30'
                }`}
              >
                {relationship === option && <Check className="w-4 h-4 font-bold" strokeWidth={3} />}
                {option}
              </button>
            ))}
            {isAddingCustom ? (
              <div className="flex items-center gap-2 bg-surface-container-high rounded-full pl-4 pr-1 h-12">
                <input
                  type="text"
                  placeholder="Custom..."
                  value={customRelText}
                  onChange={(e) => setCustomRelText(e.target.value)}
                  className="bg-transparent border-none outline-none font-medium text-on-surface w-24 placeholder:text-outline-variant text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (customRelText.trim()) {
                      setRelationship(customRelText.trim());
                    }
                    setIsAddingCustom(false);
                    setCustomRelText('');
                  }}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAddingCustom(true);
                }}
                className="h-12 w-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-highest"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Life Status Selection — TEMPORAL SAFETY FLAG */}
        <div className="space-y-4">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight">
            Status
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsLiving(true)}
              className={`h-14 flex-1 rounded-xl border-2 font-medium text-lg transition-all ${
                isLiving
                  ? 'bg-[#4e0078]/10 border-[#4e0078] text-[#4e0078] shadow-sm'
                  : 'bg-surface-container-highest border-transparent text-outline hover:bg-surface-container-highest/80'
              }`}
            >
              Living
            </button>
            <button
              onClick={() => setIsLiving(false)}
              className={`h-14 flex-1 rounded-xl border-2 font-medium text-lg transition-all ${
                !isLiving
                  ? 'bg-[#4e0078]/10 border-[#4e0078] text-[#4e0078] shadow-sm'
                  : 'bg-surface-container-highest border-transparent text-outline hover:bg-surface-container-highest/80'
              }`}
            >
              Passed Away
            </button>
          </div>
          <p className="mt-2 text-sm text-outline font-label px-1">
            This helps Memvella understand how to talk about them contextually.
          </p>
        </div>

        {/* AI Context Box */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="ai_context">Key Facts & Context</label>
            <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
          </div>
          <div className="relative">
            <textarea
              id="ai_context"
              placeholder="E.g., David lives in Chicago and loves baseball."
              rows={4}
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              className="w-full p-6 bg-surface-container-highest border-none rounded-md text-lg leading-relaxed focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 resize-none"
            ></textarea>
            <p className="mt-2 text-sm text-outline font-label px-1">What should Memvella know about them to help {lovedOneName} remember?</p>
          </div>
        </div>
      </section>

      {/* Contextual Tip Card */}
      <div className="bg-primary-fixed/30 p-6 rounded-lg relative overflow-hidden group">
        <div className="relative z-10 flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">Family Connections</h4>
            <p className="text-sm text-on-primary-fixed-variant leading-snug mt-1 font-body">Adding detailed context helps us create more meaningful reminders during {lovedOneName}&apos;s morning wellness check-in.</p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full transform scale-150 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      {/* Validation Error */}
      {error && (
        <p className="text-red-500 text-sm font-medium px-1 -mt-4">{error}</p>
      )}

      <button
        onClick={handleSavePerson}
        disabled={isSaving}
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          'Save to Family'
        )}
      </button>
    </div>
  );
}
