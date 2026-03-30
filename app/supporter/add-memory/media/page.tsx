"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';

export default function MediaMemoryPage() {
  const router = useRouter();
  const addMemoryMedia = useMutation(api.memories.addMemoryMedia);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [story, setStory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isFormValid = selectedFile !== null && title.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) return;
    
    setError(null);
    setIsSaving(true);
    try {
      // Step 1: Get a short-lived signed upload URL from Convex
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file directly to Convex storage
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });
      if (!result.ok) throw new Error('File upload failed.');

      // Step 3: Extract the storageId and save the memory record
      const { storageId } = await result.json();
      await addMemoryMedia({
        title: title.trim(),
        date: date.trim() || 'Unknown date',
        story: story.trim() || '--',
        mediaStorageId: storageId,
      });
      router.push('/supporter/memories');
    } catch (err) {
      console.error(err);
      setError('Failed to save memory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Dropzone / Preview */}
      <section className="relative group mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          id="media-file-input"
          onChange={handleFileSelect}
        />
        <label htmlFor="media-file-input" className="block cursor-pointer">
          <div className="w-full aspect-4/3 rounded-3xl bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 hover:bg-surface-container-high transition-colors overflow-hidden shadow-sm relative">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleClearFile(); }}
                  className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-full shadow-xl shadow-primary/5 mb-4 group-active:scale-95 transition-transform relative z-10">
                  <ImageIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
                <p className="font-headline font-bold text-xl text-primary relative z-10">Upload File</p>
                <p className="text-sm text-outline mt-1 font-light italic relative z-10">Tap to select from camera roll</p>
                {/* Decorative tonal bleed */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
              </>
            )}
          </div>
        </label>
      </section>

      {/* Form Essentials inside Premium White Card */}
      <section className="bg-white/80 backdrop-blur-xl rounded-4xl p-6 md:p-8 shadow-xl shadow-[#4e0078]/5 border border-white space-y-8">
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="media_title">Title</label>
          <div className="relative">
            <input
              id="media_title"
              type="text"
              required
              placeholder="Family reunion 2012"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-16 w-full rounded-2xl px-6 bg-white border-2 border-gray-100 text-lg shadow-sm focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10 outline-none transition-all placeholder:text-outline/50"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="media_date">
            When was this? <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <input
              id="media_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-16 w-full rounded-2xl px-6 bg-white border-2 border-gray-100 text-lg shadow-sm focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10 outline-none transition-all placeholder:text-outline/50"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="media_story">
            The Story <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <textarea
              id="media_story"
              placeholder="Where were you? Who is in this?"
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="appearance-none w-full p-6 bg-surface-container-highest border-none rounded-2xl text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 resize-none"
            ></textarea>
          </div>
        </div>
      </section>

      {error && (
        <p className="text-red-500 font-medium text-sm text-center px-1">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving || !isFormValid}
        className="h-16 w-full rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white font-semibold text-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 mb-8 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" />Uploading & Saving…</> : 'Save Photo/Video'}
      </button>
    </div>
  );
}
