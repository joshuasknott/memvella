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

  const handleSave = async () => {
    if (!selectedFile) {
      setError('Please select a photo or video before saving.');
      return;
    }
    if (!title.trim()) {
      setError('Please add a title.');
      return;
    }
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
      {/* Dropzone / Preview */}
      <section className="relative group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          id="media-file-input"
          onChange={handleFileSelect}
        />
        <label htmlFor="media-file-input" className="block cursor-pointer">
          <div className="w-full aspect-4/3 rounded-3xl bg-blue-50/50 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 hover:bg-blue-50 transition-colors overflow-hidden shadow-sm relative">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleClearFile(); }}
                  className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="bg-white p-5 rounded-full shadow-lg shadow-blue-900/5 mb-4 group-active:scale-95 transition-transform">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                </div>
                <p className="font-headline font-bold text-lg text-blue-900">Upload File</p>
                <p className="text-sm text-blue-600/70 mt-1 font-medium">Tap to select from camera roll</p>
              </>
            )}
          </div>
        </label>
      </section>

      {/* Form Essentials */}
      <section className="space-y-4">
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="media_title">Title</label>
          <input
            id="media_title"
            type="text"
            placeholder="Family reunion 2012"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="media_date">When was this?</label>
          <input
            id="media_date"
            type="text"
            placeholder="Summer 2012"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="media_story">The Story</label>
          <input
            id="media_story"
            placeholder="Where were you? Who is in this?"
            type="text"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400"
          />
        </div>
      </section>

      {error && (
        <p className="text-red-500 font-medium text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Uploading & Saving…</> : 'Save Photo/Video'}
      </button>
    </div>
  );
}
