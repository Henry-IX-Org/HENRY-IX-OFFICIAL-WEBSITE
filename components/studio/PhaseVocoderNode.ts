export class PhaseVocoderNode extends AudioWorkletNode {
  constructor(context: BaseAudioContext) {
    super(context, 'phase-vocoder-processor');
  }

  setPitchShift(semitones: number) {
    // Math.pow(2, semitones / 12) calculates the pitch factor
    const pitchFactor = Math.pow(2, semitones / 12);
    this.port.postMessage({ pitchFactor });
  }
}

export const setupPhaseVocoder = async (context: AudioContext): Promise<PhaseVocoderNode> => {
  await context.audioWorklet.addModule('/worklets/phaseVocoder.js');
  return new PhaseVocoderNode(context);
};
