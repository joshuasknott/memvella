"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Sparkles, Lightbulb, Mic, Camera, X, Loader2 } from 'lucide-react';

export default function TextMemoryPage() {
  const router = useRouter();
  const addMemoryText = useMutation(api.memories.addMemoryText);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

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

  const handleSaveMemory = async () => {
    if (!title.trim() || !story.trim()) {
      setError('Please add a title and the story before saving.');
      return;
    }
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
    <div className="flex flex-col gap-8 px-4 w-full">
      {/* Form Essentials */}
      <section className="space-y-8">
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="memory_title">Memory Title</label>
          <div className="relative">
            <input
              id="memory_title"
              placeholder="David's Graduation"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="appearance-none w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="memory_date">When was this?</label>
          <div className="relative">
            <input
              id="memory_date"
              placeholder="Spring 2019"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="appearance-none w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
            />
          </div>
        </div>

        <div className="space-y-3">
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
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 pt-4 pb-14 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
              <button type="button" className="absolute bottom-3 right-3 p-2.5 bg-purple-100 text-purple-700 rounded-full shadow-sm active:scale-95 transition-transform">
                <Mic size={20} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-outline font-label px-1">What happened? How did it make you feel?</p>
        </div>
      </section>

      {/* Contextual Tip Card */}
      <div className="bg-primary-fixed/30 p-6 rounded-lg relative overflow-hidden group">
        <div className="relative z-10 flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">Memory Curation</h4>
            <p className="text-sm text-on-primary-fixed-variant leading-snug mt-1 font-body">Adding stories triggers Memvella to organically bring them up during conversations with Mom.</p>
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
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
          <img src={photoPreview} alt="Photo preview" className="w-full h-48 object-cover" />
          <button
            onClick={handleClearPhoto}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label htmlFor="photo-input">
          <div className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-700 font-medium active:bg-gray-50 transition-colors cursor-pointer">
            <Camera size={22} className="text-blue-600" />
            Add Photo (Optional)
          </div>
        </label>
      )}

      {error && (
        <p className="text-red-500 font-medium text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleSaveMemory}
        disabled={isSaving}
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />{selectedPhoto ? 'Uploading & Saving…' : 'Saving…'}</> : 'Save Memory'}
      </button>
    </div>
  );
}
