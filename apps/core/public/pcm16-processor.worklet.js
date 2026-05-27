class Pcm16Processor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0]?.[0];
    if (!input || input.length === 0) {
      return true;
    }

    const ratio = sampleRate / 16000;
    const outputLength =
      ratio <= 1
        ? input.length
        : Math.max(1, Math.round(input.length / ratio));

    const output = new Int16Array(outputLength);
    let outputIndex = 0;
    let inputIndex = 0;

    if (ratio <= 1) {
      for (let i = 0; i < input.length; i += 1) {
        const s = Math.max(-1, Math.min(1, input[i] ?? 0));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
    } else {
      while (outputIndex < outputLength) {
        const nextInputIndex = Math.min(
          input.length,
          Math.round((outputIndex + 1) * ratio),
        );
        let accumulator = 0;
        let count = 0;

        for (let i = inputIndex; i < nextInputIndex; i += 1) {
          accumulator += input[i] ?? 0;
          count += 1;
        }

        const averaged = Math.max(-1, Math.min(1, accumulator / Math.max(count, 1)));
        output[outputIndex] =
          averaged < 0 ? averaged * 0x8000 : averaged * 0x7fff;

        outputIndex += 1;
        inputIndex = nextInputIndex;
      }
    }

    this.port.postMessage(output.buffer, [output.buffer]);
    return true;
  }
}

registerProcessor("pcm16-processor", Pcm16Processor);
