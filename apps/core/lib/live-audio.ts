/** Gemini's audio payload uses base64 PCM, not a browser Blob. */
export function encodeLiveAudio(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { data: btoa(binary), mimeType: "audio/pcm;rate=16000" };
}

export function decodeLiveAudio(data: string) {
  const binary = atob(data);
  if (binary.length % 2) throw new Error("Incomplete PCM audio sample");
  const samples = new Float32Array(binary.length / 2);
  for (let i = 0; i < samples.length; i++) {
    const unsigned = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
    samples[i] = (unsigned >= 32768 ? unsigned - 65536 : unsigned) / 32768;
  }
  return samples;
}

/** Schedule native audio continuously and cancel queued speech on interruption. */
export class LiveAudioPlayer {
  private context: AudioContext;
  private sources = new Set<AudioBufferSourceNode>();
  private nextTime = 0;

  constructor(private onSpeaking: (speaking: boolean) => void) {
    this.context = new AudioContext();
  }

  async resume() {
    await this.context.resume();
  }

  play(data: string) {
    const samples = decodeLiveAudio(data);
    if (!samples.length) return;
    const buffer = this.context.createBuffer(1, samples.length, 24000);
    buffer.copyToChannel(samples, 0);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    this.sources.add(source);
    source.onended = () => {
      source.disconnect();
      this.sources.delete(source);
      if (!this.sources.size) this.onSpeaking(false);
    };
    const start = Math.max(this.context.currentTime + 0.02, this.nextTime);
    source.start(start);
    this.nextTime = start + buffer.duration;
    this.onSpeaking(true);
  }

  stop() {
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
      source.disconnect();
    }
    this.sources.clear();
    this.nextTime = 0;
    this.onSpeaking(false);
  }

  async close() {
    this.stop();
    await this.context.close();
  }
}
