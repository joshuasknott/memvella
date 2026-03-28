"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Music, Upload, Loader2 } from 'lucide-react';

export default function AudioMemoryPage() {
  const router = useRouter();
  const addMemoryAudio = useMutation(api.memories.addMemoryAudio);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [songLink, setSongLink] = useState('');
  const [story, setStory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !story.trim()) {
      setError('Please add a title and context before saving.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await addMemoryAudio({
        title: title.trim(),
        date: date.trim() || 'Unknown date',
        story: story.trim(),
        songLink: songLink.trim() || undefined,
        mediaStorageId: undefined, // File upload not yet implemented
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
      {/* Soft Icon Hero */}
      <section className="flex justify-center mt-2 mb-2">
        <div className="w-24 h-24 bg-pink-50 rounded-4xl flex items-center justify-center shadow-sm border border-pink-100">
          <Music className="w-10 h-10 text-pink-500" />
        </div>
      </section>

      {/* Form Essentials */}
      <section className="space-y-6">
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="audio_title">Memory Title</label>
          <input
            id="audio_title"
            type="text"
            placeholder="Our Wedding Song"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="audio_date">When was this?</label>
          <input
            id="audio_date"
            type="text"
            placeholder="Summer 1987"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="song_link">Spotify or Apple Music Link</label>
          <div className="relative">
            <input
              id="song_link"
              type="text"
              placeholder="https://open.spotify.com/track/..."
              value={songLink}
              onChange={(e) => setSongLink(e.target.value)}
              className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="song_context">Why does Mom love this?</label>
          <div className="relative">
            <textarea
              id="song_context"
              placeholder="They played this at her wedding..."
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
            ></textarea>
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-2">
        <h3 className="font-headline font-bold text-lg text-gray-900 tracking-tight">Or upload a file directly</h3>
        <button className="w-full bg-purple-50 text-purple-700 rounded-2xl p-4 flex items-center justify-center gap-2 border border-purple-100 hover:bg-purple-100 active:scale-95 transition-colors">
          <Upload className="w-5 h-5" />
          <span className="font-bold">Upload Audio or Video (MP4)</span>
        </button>
      </section>

      {error && (
        <p className="text-red-500 font-medium text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</> : 'Save Audio Memory'}
      </button>
    </div>
  );
}
