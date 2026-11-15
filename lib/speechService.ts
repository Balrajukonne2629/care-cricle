/**
 * Browser Web Speech API service for CareCircle
 * Provides tactile, warm Text-to-Speech (TTS) and voice command recognition.
 */

export interface VoiceCommandResult {
  action: 'read_schedule' | 'confirm_taken' | 'check_medication' | 'trigger_sos' | 'query_appointment' | 'unknown';
  targetMedication?: string;
  slot?: 'morning' | 'afternoon' | 'evening';
  rawTranscript: string;
}

// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Text-to-Speech synthesizer with warm elderly cadence
 */
export class SpeechService {
  private static synth: SpeechSynthesis | null = isBrowser && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static preferredVoice: SpeechSynthesisVoice | null = null;

  /**
   * Initializes preferred pleasant natural voice
   */
  public static initVoice(): void {
    if (!this.synth) return;

    const findVoice = () => {
      const voices = this.synth?.getVoices() || [];
      // Look for natural warm English voices (e.g., Google US English, Samantha, Karen, Natural)
      const warmVoice = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Karen') || v.name.includes('Zira')) &&
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en'));

      if (warmVoice) {
        this.preferredVoice = warmVoice;
      }
    };

    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  /**
   * Speak a text string with comfortable, calm elderly cadence
   */
  public static speak(
    text: string,
    options: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('Speech synthesis not supported in this environment');
        resolve();
        return;
      }

      this.synth.cancel(); // Stop any overlapping speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 0.88; // Slightly relaxed pace for elderly comprehension
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.error('TTS error:', e);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static isSpeaking(): boolean {
    return !!this.synth?.speaking;
  }
}

/**
 * Parses spoken speech transcript into structured healthcare intent
 */
export function parseElderVoiceCommand(transcript: string): VoiceCommandResult {
  const text = transcript.toLowerCase().trim();

  // Emergency SOS triggers
  if (text.includes('emergency') || text.includes('help me') || text.includes('call help') || text.includes('sos') || text.includes('call family')) {
    return {
      action: 'trigger_sos',
      rawTranscript: transcript
    };
  }

  // Confirming taken pills
  if (text.includes('took') || text.includes('taken') || text.includes('mark') || text.includes('done with pill')) {
    let slot: 'morning' | 'afternoon' | 'evening' | undefined;
    if (text.includes('morning')) slot = 'morning';
    else if (text.includes('afternoon') || text.includes('lunch')) slot = 'afternoon';
    else if (text.includes('evening') || text.includes('night') || text.includes('bed')) slot = 'evening';

    let targetMed: string | undefined;
    if (text.includes('lisinopril')) targetMed = 'Lisinopril';
    else if (text.includes('metformin')) targetMed = 'Metformin';
    else if (text.includes('atorvastatin')) targetMed = 'Atorvastatin';
    else if (text.includes('aspirin')) targetMed = 'Aspirin';

    return {
      action: 'confirm_taken',
      targetMedication: targetMed,
      slot,
      rawTranscript: transcript
    };
  }

  // Asking what to take / reading schedule
  if (
    text.includes('what should i take') ||
    text.includes('read') ||
    text.includes('schedule') ||
    text.includes('my pills') ||
    text.includes('medicine') ||
    text.includes('what do i take')
  ) {
    let slot: 'morning' | 'afternoon' | 'evening' | undefined;
    if (text.includes('morning')) slot = 'morning';
    else if (text.includes('afternoon')) slot = 'afternoon';
    else if (text.includes('evening') || text.includes('night')) slot = 'evening';

    return {
      action: 'read_schedule',
      slot,
      rawTranscript: transcript
    };
  }

  // Doctor / appointment query
  if (text.includes('appointment') || text.includes('doctor') || text.includes('visit') || text.includes('clinic')) {
    return {
      action: 'query_appointment',
      rawTranscript: transcript
    };
  }

  // Query specific medication
  if (text.includes('did i take') || text.includes('check')) {
    return {
      action: 'check_medication',
      rawTranscript: transcript
    };
  }

  return {
    action: 'unknown',
    rawTranscript: transcript
  };
}
