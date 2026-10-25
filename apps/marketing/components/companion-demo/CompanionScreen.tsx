import { ArrowLeft, CalendarClock, Check, FileText, Flower, Mic, Pause, Play } from "lucide-react";
import { STORY, sceneAt, type Interaction } from "./demo-model";
import styles from "./companion-demo.module.css";

const recordingBars = [10, 24, 32, 20, 27, 14, 21, 12, 18, 16, 24, 30, 18, 12, 17, 10, 14, 22, 17, 12, 8, 6, 4, 3, 3, 3];

export interface ScreenProps {
  frame: number;
  interaction: Interaction;
  compact?: boolean;
  motion?: number;
  narrating?: boolean;
  audioNotice?: string;
  onAction: (interaction: Interaction) => void;
  onNarrate: () => void;
}

export function CompanionScreen({ frame, interaction, compact = false, motion = 1, narrating = false, audioNotice = "", onAction, onNarrate }: ScreenProps) {
  const scene = sceneAt(frame, interaction);
  const conversation = scene === "conversation" || scene === "lunch" || scene === "next";
  const routine = scene === "routine" || scene === "confirmed";
  const expanded = scene !== null;
  return (
    <div className={styles.screen} data-compact={compact || undefined} aria-label="Example companion tablet for Margaret">
      <div className={styles.topbar}>
        <Flower size={40} strokeWidth={1.7} aria-hidden="true" />
        <div className={styles.date}><strong>10:30</strong><span>Wednesday 21 October</span></div>
      </div>
      <div className={styles.greeting}>
        <span>Good morning,</span><strong>Margaret.</strong>
      </div>
      {expanded ? (
        <div className={styles.exampleScene} style={{ opacity: motion, translate: `0 ${(1 - motion) * 8}px` }}>
          <div className={styles.sceneTop}>
            <span>{conversation ? "Example conversation" : routine ? "A gentle reminder" : "A memory from Anna"}</span>
            <button type="button" onClick={() => onAction(null)} aria-label="Back to the companion"><ArrowLeft size={20} aria-hidden="true" /> Back</button>
          </div>
          {scene === "story" ? (
            <div className={styles.storyScene}>
              <h3 tabIndex={-1} data-demo-heading>The Sunday lunch story</h3>
              <p>{STORY}</p>
              <button type="button" className={styles.readAloud} onClick={onNarrate}>
                {narrating ? <Pause size={21} aria-hidden="true" /> : <Play size={21} fill="currentColor" aria-hidden="true" />}
                {narrating ? "Stop reading" : "Read the story aloud"}
              </button>
              <span className={styles.audioHint}>Example narration using your browser’s voice.</span>
            </div>
          ) : routine ? (
            <div className={styles.routineScene}>
              <CalendarClock size={38} strokeWidth={1.5} aria-hidden="true" />
              <div><h3 tabIndex={-1} data-demo-heading>Time for tea in the garden.</h3><p>A little fresh air, and your favourite cup.</p></div>
              <button type="button" className={styles.confirmRoutine} onClick={() => onAction(scene === "confirmed" ? "routine" : "confirmed")}>
                {scene === "confirmed" && <Check size={23} aria-hidden="true" />}
                {scene === "confirmed" ? "All done — reset example" : "I’ve had my tea"}
              </button>
            </div>
          ) : (
            <div className={styles.conversationScene}>
              <h3 tabIndex={-1} data-demo-heading>{scene === "conversation" ? "What would you like to talk about?" : scene === "lunch" ? "Tell me about Sunday lunch." : "What’s happening today?"}</h3>
              {scene !== "conversation" && <p className={styles.reply}>{scene === "lunch" ? "Anna shared that you always made room for one more at Sunday lunch. She remembers trying to sneak an extra Yorkshire pudding. What did you enjoy cooking?" : "There’s tea in the garden at three. A quiet moment with your favourite cup."}</p>}
              <div className={styles.prompts} aria-label="Try an example question">
                <button type="button" onClick={() => onAction("lunch")} aria-pressed={scene === "lunch"}>Sunday lunch</button>
                <button type="button" onClick={() => onAction("next")} aria-pressed={scene === "next"}>What’s next today?</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={styles.content}>
            <div className={styles.memory}>
              <div className={styles.memoryHeading}>
                <span className={styles.memoryIcon}><FileText size={33} strokeWidth={1.7} aria-hidden="true" /></span>
                <div><h3>The Sunday lunch story</h3><p>There was always room for one more at the table.</p><span className={styles.byline}>Shared by Anna</span></div>
              </div>
              <div className={styles.memoryAudio}>
                <button type="button" className={styles.audioPlay} onClick={onNarrate} aria-label="Play example narration of Anna’s story"><Play size={24} fill="currentColor" aria-hidden="true" /></button>
                <div className={styles.recording} aria-hidden="true"><span>Anna’s story</span><div className={styles.recordingTrack}>{recordingBars.map((height, index) => <span key={index} style={{ height }} />)}</div></div>
                <button type="button" className={styles.readStory} onClick={() => onAction("story")}>Read story</button>
              </div>
            </div>
            <button type="button" className={styles.routine} onClick={() => onAction("routine")} aria-label="Explore the tea in the garden reminder">
              <span>Next up</span><CalendarClock size={37} strokeWidth={1.5} aria-hidden="true" /><strong>Tea in the garden</strong><span className={styles.routineTime}>3:00 pm</span>
            </button>
          </div>
          <button type="button" className={styles.talk} onClick={() => onAction("conversation")}><Mic size={39} strokeWidth={1.6} aria-hidden="true" />Tap to talk</button>
        </>
      )}
      {audioNotice && <p role="status" className={styles.audioNotice}>{audioNotice}</p>}
    </div>
  );
}
