// TypeScript declarations for AudioWorklet global types
// @ts-ignore for browser worklet context
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

// ts-check disabled for brevity
class VADProcessor extends AudioWorkletProcessor {
  // simple energy VAD
  private readonly threshold = 0.01;
  process(inputs: Float32Array[][]) {
    const input = inputs[0][0];
    if (!input) return true;
    let sum = 0;
    for (let i = 0; i < input.length; i++) sum += input[i] ** 2;
    const rms = Math.sqrt(sum / input.length);
    this.port.postMessage(rms > this.threshold);
    return true;
  }
}
registerProcessor("vad-processor", VADProcessor);
