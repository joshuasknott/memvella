"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Sparkles, Lightbulb, Mic, Camera, X, Loader2 } from 'lucide-react';
import { FormCard } from '@/components/ui/FormCard';

export default function TextMemoryPage() {
  const router = useRouter();
  const addMemoryText = useMutation(api.memories.addMemoryText);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);
  
  const lovedOneName = "your loved one"; // TODO: wire to Convex profile

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [story, setStory] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const isFormValid = title.trim().length > 0 && story.trim().length > 0;

  const handleSaveMemory = async () => {
    if (!isFormValid) return;
    
    setError(null);
    setIsSaving(true);
    try {
      let photoStorageId: Id<'_storage'> | undefined = undefined;

      // Optional 3-step upload if a photo was attached
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

      await addMemoryText({
        title: title.trim(),
        date: date.trim() || 'Unknown date',
        story: story.trim(),
        photoStorageId,
      });
      router.push('/caregiver/memories');
    } catch (err) {
      console.error(err);
      setError('Failed to save memory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Form Essentials inside Premium White Card */}
      <FormCard as="section" className="space-y-8 mt-4">
        <div className="space-y-6">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="memory_title">Memory Title</label>
          <div className="relative">
            <input
              id="memory_title"
              placeholder="David's Graduation"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30 focus:border-[#4e0078] border border-gray-200 transition-all bg-white rounded-2xl px-6 h-16 w-full text-lg"
            />
          </div>
        </div>

        <div className="space-y-6">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="memory_date">
            When was this? <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <input
              id="memory_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30 focus:border-[#4e0078] border border-gray-200 transition-all bg-white rounded-2xl px-6 h-16 w-full text-lg"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="ai_context">The Story</label>
            <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
          </div>
          <div className="w-full">
            <div className="relative w-full">
              <textarea
                id="ai_context"
                placeholder="David graduated from college and we had a big family picnic..."
                rows={5}
                required
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30 focus:border-[#4e0078] border border-gray-200 transition-all bg-white rounded-2xl p-6 min-h-[120px] pb-14 w-full text-lg resize-none placeholder:text-outline/50"
              ></textarea>
              <button type="button" className="absolute bottom-4 right-4 p-3 bg-primary/10 text-primary rounded-full shadow-sm active:scale-95 transition-transform hover:bg-primary/20">
                <Mic size={24} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-outline font-label px-1">What happened? How did it make you feel?</p>
        </div>
      </FormCard>

      {/* Contextual Tip Card */}
      <div className="bg-primary-fixed/30 p-6 rounded-3xl relative overflow-hidden group">
        <div className="relative z-10 flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">Memory Curation</h4>
            <p className="text-sm text-on-primary-fixed-variant leading-snug mt-1 font-body">Adding stories triggers Memvella to organically bring them up during conversations with {lovedOneName}.</p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full transform scale-150 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      {/* Optional Photo Attachment */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="photo-input"
        onChange={handlePhotoSelect}
      />
      {photoPreview ? (
        <div className="relative rounded-3xl overflow-hidden shadow-sm">
          <img src={photoPreview} alt="Photo preview" className="w-full h-48 object-cover" />
          <button
            onClick={handleClearPhoto}
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label htmlFor="photo-input">
          <div className="w-full bg-white shadow-sm rounded-3xl p-6 flex items-center justify-center gap-3 text-primary font-bold text-lg active:scale-[0.98] transition-all cursor-pointer border-2 border-dashed border-outline-variant/40 hover:bg-surface-container-lowest">
            <Camera size={26} />
            Add Photo <span className="text-sm font-normal text-outline italic ml-1">(Optional)</span>
          </div>
        </label>
      )}

      {error && (
        <p className="text-red-500 font-medium text-sm text-center px-1">{error}</p>
      )}

      <button
        onClick={handleSaveMemory}
        disabled={isSaving || !isFormValid}
        className="h-16 w-full rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white font-semibold text-xl mb-8 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" />{selectedPhoto ? 'Uploading & Saving…' : 'Saving…'}</> : 'Save Memory'}
      </button>
    </div>
  );
}
