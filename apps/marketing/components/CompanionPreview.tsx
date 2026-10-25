"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CompanionWalkthrough } from "./companion-demo/CompanionWalkthrough";
import { CompanionScreen } from "./companion-demo/CompanionScreen";
import { chapters, chapterAt, chapterForInteraction, DEMO_FPS, DEMO_FRAMES, STORY, type Chapter, type Interaction } from "./companion-demo/demo-model";
import styles from "./companion-demo/companion-demo.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (callback: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getMotionPreference = () => window.matchMedia(motionQuery).matches;
const serverMotionPreference = () => true;

export function CompanionPreview() {
  const playerRef = useRef<PlayerRef>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Chapter>("memory");
  const [frame, setFrame] = useState(0);
  const [interaction, setInteraction] = useState<Interaction>(null);
  const [ended, setEnded] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [audioNotice, setAudioNotice] = useState("");
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionPreference, serverMotionPreference);

  const stopNarration = useCallback(() => {
    if (speechRef.current) {
      speechRef.current.onend = null;
      speechRef.current.onerror = null;
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
    setNarrating(false);
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    stopNarration();
    setPlaying(false);
  }, [stopNarration]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => { setPlaying(true); setEnded(false); };
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setEnded(true); };
    const onFrame = ({ detail }: { detail: { frame: number } }) => {
      setActiveChapter(chapterAt(detail.frame));
      // The native phone view needs scene changes, not 30 whole-page renders a second.
      setFrame((previous) => Math.floor(previous / 15) === Math.floor(detail.frame / 15) ? previous : detail.frame);
    };
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.addEventListener("frameupdate", onFrame);
    const onVisibility = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    if (previewRef.current) observer.observe(previewRef.current);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("frameupdate", onFrame);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      if (speechRef.current) {
        speechRef.current.onend = null;
        speechRef.current.onerror = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [pause]);

  const selectScene = useCallback((next: Interaction) => {
    pause();
    setInteraction(next);
    setEnded(false);
    setAudioNotice("");
    const chapter = chapterForInteraction(next);
    setActiveChapter(chapter);
    if (!next) { playerRef.current?.seekTo(0); setFrame(0); }
    window.requestAnimationFrame(() => {
      const target = [...(previewRef.current?.querySelectorAll<HTMLElement>(next ? "[data-demo-heading]" : "button") ?? [])]
        .find((element) => element.getClientRects().length > 0);
      target?.focus({ preventScroll: true });
    });
  }, [pause]);

  const narrate = useCallback(() => {
    if (speechRef.current) { stopNarration(); return; }
    selectScene("story");
    if (!("speechSynthesis" in window)) {
      setAudioNotice("Your browser can’t read this aloud. You can read Anna’s story here.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(STORY);
    utterance.lang = "en-GB";
    utterance.rate = 0.9;
    const britishVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang === "en-GB");
    if (britishVoice) utterance.voice = britishVoice;
    utterance.onend = () => { setNarrating(false); speechRef.current = null; };
    utterance.onerror = () => {
      setNarrating(false);
      speechRef.current = null;
      setAudioNotice("Audio isn’t available right now. You can still read Anna’s story.");
    };
    speechRef.current = utterance;
    setNarrating(true);
    window.speechSynthesis.speak(utterance);
  }, [selectScene, stopNarration]);

  const play = (restart = false) => {
    stopNarration();
    setInteraction(null);
    setAudioNotice("");
    if (restart || ended || interaction) {
      playerRef.current?.seekTo(0);
      setFrame(0);
      setActiveChapter("memory");
    }
    setEnded(false);
    playerRef.current?.play();
  };

  const chooseChapter = (chapter: typeof chapters[number]) => {
    pause();
    setInteraction(null);
    setAudioNotice("");
    setEnded(false);
    playerRef.current?.seekTo(chapter.frame);
    setFrame(chapter.frame);
    setActiveChapter(chapter.id);
  };

  const inputProps = useMemo(() => ({
    reducedMotion, interaction, narrating, audioNotice, onAction: selectScene, onNarrate: narrate,
  }), [reducedMotion, interaction, narrating, audioNotice, selectScene, narrate]);

  return (
    <div className={styles.preview} ref={previewRef}>
      <div className={styles.desktopDevice}>
        <Player
          ref={playerRef}
          component={CompanionWalkthrough}
          durationInFrames={DEMO_FRAMES}
          compositionWidth={1200}
          compositionHeight={770}
          fps={DEMO_FPS}
          inputProps={inputProps}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          moveToBeginningWhenEnded={false}
          className={styles.player}
          style={{ width: "100%" }}
        />
      </div>
      <div className={styles.mobileDevice}>
        <CompanionScreen frame={frame} interaction={interaction} compact narrating={narrating} audioNotice={audioNotice} onAction={selectScene} onNarrate={narrate} />
      </div>
      <p className={styles.caption}>Example companion. Try a button, or take a little tour.</p>
      <div className={styles.controls}>
        <div className={styles.playback}>
          <button type="button" className={styles.playButton} onClick={() => playing ? pause() : play()} aria-label={playing ? "Pause walkthrough" : ended ? "Replay walkthrough" : "Play 24-second walkthrough"}>
            {playing ? <Pause size={17} fill="currentColor" aria-hidden="true" /> : <Play size={17} fill="currentColor" aria-hidden="true" />}
            {playing ? "Pause" : ended ? "Replay" : "Play walkthrough"}
            <span className={styles.duration}>24s</span>
          </button>
          <button type="button" className={styles.resetButton} onClick={() => { pause(); setInteraction(null); setFrame(0); setActiveChapter("memory"); setEnded(false); setAudioNotice(""); playerRef.current?.seekTo(0); }} aria-label="Reset the companion demo">
            <RotateCcw size={19} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.chapters} role="group" aria-label="Explore the companion">
          {chapters.map((chapter) => <button type="button" key={chapter.id} onClick={() => chooseChapter(chapter)} aria-pressed={activeChapter === chapter.id}>{chapter.label}</button>)}
        </div>
      </div>
      <p className={styles.note}>Fictional memories and example conversations. No microphone needed.</p>
    </div>
  );
}
