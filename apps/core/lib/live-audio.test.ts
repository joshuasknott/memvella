import { readFileSync } from "node:fs";
import vm from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeLiveAudio, encodeLiveAudio, LiveAudioPlayer } from "./live-audio";

afterEach(() => vi.unstubAllGlobals());

describe("live microphone audio", () => {
  it("flushes the final partial packet before acknowledging the end of a manual turn", () => {
    const messages: (ArrayBuffer | string)[] = [];
    let Processor: new () => {
      process: (inputs: Float32Array[][]) => boolean;
      port: { onmessage: (event: { data: string }) => void };
    };
    vm.runInNewContext(readFileSync(new URL("../public/pcm16-processor.worklet.js", import.meta.url), "utf8"), {
      sampleRate: 16000,
      AudioWorkletProcessor: class { port = { postMessage: (message: ArrayBuffer | string) => messages.push(message) }; },
      registerProcessor: (_name: string, constructor: typeof Processor) => { Processor = constructor; },
    });
    const processor = new Processor!();
    processor.process([[new Float32Array(128).fill(0.5)]]);
    expect(messages).toHaveLength(0);
    processor.port.onmessage({ data: "flush" });
    expect((messages[0] as ArrayBuffer).byteLength).toBe(256);
    expect(messages[1]).toBe("flushed");
    processor.port.onmessage({ data: "flush" });
    expect(messages).toHaveLength(3);
    expect(messages[2]).toBe("flushed");
  });

  it("encodes PCM bytes in the Gemini wire format", () => {
    const payload = encodeLiveAudio(new Uint8Array([0, 128, 255, 127]).buffer);
    expect(payload.mimeType).toBe("audio/pcm;rate=16000");
    expect([...Buffer.from(payload.data, "base64")]).toEqual([0, 128, 255, 127]);
  });

  it("decodes signed little-endian PCM for native playback", () => {
    expect([...decodeLiveAudio(Buffer.from([0, 128, 0, 0, 255, 127]).toString("base64"))])
      .toEqual([-1, 0, 32767 / 32768]);
    expect(() => decodeLiveAudio("AA==")).toThrow("Incomplete PCM");
  });

  it("schedules consecutive audio and cancels every queued source on interruption", async () => {
    const sources: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal("AudioContext", class {
      currentTime = 1;
      destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
      createBuffer(_channels: number, length: number, rate: number) {
        return { duration: length / rate, copyToChannel: vi.fn() };
      }
      createBufferSource() {
        const source = { start: vi.fn(), stop: vi.fn(), disconnect: vi.fn(), connect: vi.fn(), onended: null, buffer: null };
        sources.push(source);
        return source;
      }
    });
    const speaking = vi.fn();
    const player = new LiveAudioPlayer(speaking);
    await player.resume();
    const pcm = Buffer.alloc(4800).toString("base64");
    player.play(pcm);
    player.play(pcm);
    expect(sources[0]!.start).toHaveBeenCalledWith(1.02);
    expect(sources[1]!.start.mock.calls[0]![0]).toBeCloseTo(1.12);
    player.stop();
    for (const source of sources) {
      expect(source.stop).toHaveBeenCalledOnce();
      expect(source.disconnect).toHaveBeenCalledOnce();
    }
    expect(speaking).toHaveBeenLastCalledWith(false);
    await player.close();
  });

  it.each([16000, 44100, 48000])("loads the browser worklet and preserves duration at %i Hz", (sampleRate) => {
    const packets: ArrayBuffer[] = [];
    let Processor: new () => { process: (inputs: Float32Array[][]) => boolean };
    const source = readFileSync(new URL("../public/pcm16-processor.worklet.js", import.meta.url), "utf8");
    vm.runInNewContext(source, {
      sampleRate,
      AudioWorkletProcessor: class {
        port = { postMessage: (packet: ArrayBuffer) => packets.push(packet) };
      },
      registerProcessor: (_name: string, constructor: typeof Processor) => { Processor = constructor; },
    });
    const processor = new Processor!();
    for (let offset = 0; offset < sampleRate; offset += 128) {
      processor.process([[new Float32Array(Math.min(128, sampleRate - offset)).fill(0.5)]]);
    }
    expect(packets.reduce((total, packet) => total + packet.byteLength / 2, 0)).toBe(16000);
    expect(new Int16Array(packets[0]!)[0]).toBe(16383);
  });
});
