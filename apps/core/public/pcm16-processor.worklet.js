// Loaded directly by the browser: keep this file plain JavaScript.
class Pcm16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.remaining = sampleRate / 16000;
    this.sum = 0;
    this.packet = new Int16Array(1600);
    this.packetIndex = 0;
    this.port.onmessage = (event) => {
      if (event.data !== 'flush') return;
      if (this.packetIndex) {
        const tail = this.packet.slice(0, this.packetIndex);
        this.port.postMessage(tail.buffer, [tail.buffer]);
      }
      this.packetIndex = 0;
      this.remaining = sampleRate / 16000;
      this.sum = 0;
      this.port.postMessage('flushed');
    };
  }
  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    const ratio = sampleRate / 16000;
    // Preserve fractional weights across render blocks to avoid clock drift.
    for (const value of input) {
      let available = 1;
      while (available > 1e-9) {
        const weight = Math.min(available, this.remaining);
        this.sum += value * weight;
        this.remaining -= weight;
        available -= weight;
        if (this.remaining < 1e-9) {
          const sample = Math.max(-1, Math.min(1, this.sum / ratio));
          this.packet[this.packetIndex++] = sample < 0 ? sample * 32768 : sample * 32767;
          this.remaining = ratio;
          this.sum = 0;
          if (this.packetIndex === this.packet.length) {
            this.port.postMessage(this.packet.buffer, [this.packet.buffer]);
            this.packet = new Int16Array(1600);
            this.packetIndex = 0;
          }
        }
      }
    }
    return true;
  }
}
registerProcessor('pcm16-processor', Pcm16Processor);
