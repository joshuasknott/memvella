"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Sparkles, Music, Upload, Loader2 } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import { FormCard } from '@/components/ui/FormCard';

export default function AudioMemoryPage() {
  const router = useRouter();
  const addMemoryAudio = useMutation(api.memories.addMemoryAudio);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [songLink, setSongLink] = useState('');
  const [story, setStory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = title.trim().length > 0 && story.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) return;
    
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
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Soft Icon Hero */}
      <section className="flex justify-center mt-8 mb-4">
        <div className="w-28 h-28 bg-surface-container-low rounded-full flex items-center justify-center shadow-xl shadow-primary/5 border border-outline-variant/20 relative">
          <Music className="w-12 h-12 text-primary" strokeWidth={1.5} />
          {/* Decorative tonal bleed */}
          <div className="absolute top-1/2 left-1/2 -transform-x-1/2 -transform-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10"></div>
        </div>
      </section>

      {/* Form Essentials inside Premium White Card */}
      <FormCard as="section" className="space-y-8">
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="audio_title">Memory Title</label>
          <div className="relative">
            <TextInput
              id="audio_title"
              type="text"
              required
              placeholder="Our Wedding Song"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="audio_date">
            When was this? <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <TextInput
              id="audio_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="song_link">
            Link <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <TextInput
              id="song_link"
              type="url"
              placeholder="Spotify or Apple Music..."
              value={songLink}
              onChange={(e) => setSongLink(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="song_context">Why does Mom love this?</label>
          <div className="relative">
            <textarea
              id="song_context"
              placeholder="They played this at her wedding..."
              rows={4}
              required
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="appearance-none w-full p-6 bg-surface-container-highest border-none rounded-2xl text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 resize-none"
            ></textarea>
          </div>
        </div>
      </FormCard>

      <section className="space-y-4 pt-2">
        <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight text-center">Or upload a file directly</h3>
        <SecondaryButton>
          <Upload className="w-6 h-6" />
          <span className="font-bold">Upload Audio or Video (MP4)</span>
        </SecondaryButton>
      </section>

      {error && (
        <p className="text-red-500 font-medium text-sm text-center px-1">{error}</p>
      )}

      <PrimaryButton
        onClick={handleSave}
        disabled={isSaving || !isFormValid}
        className="mb-8"
      >
        {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" />Saving…</> : 'Save Audio Memory'}
      </PrimaryButton>
    </div>
  );
}
