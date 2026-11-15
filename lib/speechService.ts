/**
 * Browser Web Speech API service for CareCircle
 * Provides tactile, warm Text-to-Speech (TTS) in Indian Native Languages
 * (Hindi, Telugu, Tamil, Indian English) and multilingual intent recognition.
 */

import { NativeLanguage } from './types';

export interface VoiceCommandResult {
  action: 'read_schedule' | 'confirm_taken' | 'check_medication' | 'trigger_sos' | 'query_appointment' | 'unknown';
  targetMedication?: string;
  slot?: 'morning' | 'afternoon' | 'evening';
  rawTranscript: string;
  detectedLanguage?: NativeLanguage;
}

const isBrowser = typeof window !== 'undefined';

export class SpeechService {
  private static synth: SpeechSynthesis | null = isBrowser && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static currentLang: NativeLanguage = 'en';

  public static setLanguage(lang: NativeLanguage): void {
    this.currentLang = lang;
  }

  public static getLanguage(): NativeLanguage {
    return this.currentLang;
  }

  public static initVoice(): void {
    if (!this.synth) return;
    // Pre-warm voices
    this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.synth?.getVoices();
      };
    }
  }

  /**
   * Speak a text string with comfortable, calm cadence in chosen Indian language
   */
  public static speak(
    text: string,
    options: {
      lang?: NativeLanguage;
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('Speech synthesis not supported in this environment');
        resolve();
        return;
      }

      this.synth.cancel(); // Stop any overlapping audio

      const targetLang = options.lang || this.currentLang;
      const utterance = new SpeechSynthesisUtterance(text);

      // Map language code to BCP-47
      const langLocaleMap: Record<NativeLanguage, string> = {
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        en: 'en-IN',
      };

      utterance.lang = langLocaleMap[targetLang] || 'en-IN';
      utterance.rate = options.rate ?? 0.84; // Slower, clear pace for elderly comprehension
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Select language-appropriate voice
      const voices = this.synth.getVoices();
      const matchingVoice = voices.find(v => v.lang.replace('_', '-').startsWith(utterance.lang.slice(0, 2)));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('TTS notice:', e);
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
 * Parses spoken speech transcript across English, Hindi, and Telugu into healthcare intents
 */
export function parseElderVoiceCommand(transcript: string): VoiceCommandResult {
  const text = transcript.toLowerCase().trim();

  // Emergency SOS triggers (English + Hindi "madad/bachao/emergency" + Telugu "sahayam/aapadha")
  if (
    text.includes('emergency') ||
    text.includes('help me') ||
    text.includes('call help') ||
    text.includes('sos') ||
    text.includes('call family') ||
    text.includes('madad') ||
    text.includes('bachao') ||
    text.includes('khatra') ||
    text.includes('sahayam') ||
    text.includes('aapadha')
  ) {
    return {
      action: 'trigger_sos',
      rawTranscript: transcript,
    };
  }

  // Confirming taken pills (English + Hindi "le li/kha li/goli" + Telugu "teesukunna/vesukunna/mandulu")
  if (
    text.includes('took') ||
    text.includes('taken') ||
    text.includes('mark') ||
    text.includes('done') ||
    text.includes('le li') ||
    text.includes('kha li') ||
    text.includes('goli li') ||
    text.includes('dawai li') ||
    text.includes('teesukunna') ||
    text.includes('vesukunna') ||
    text.includes('mandulu') ||
    text.includes('saapitten')
  ) {
    let slot: 'morning' | 'afternoon' | 'evening' | undefined;
    if (text.includes('morning') || text.includes('subah') || text.includes('udayam') || text.includes('kaalai')) {
      slot = 'morning';
    } else if (text.includes('afternoon') || text.includes('dopahar') || text.includes('lunch') || text.includes('madhyanam')) {
      slot = 'afternoon';
    } else if (text.includes('evening') || text.includes('night') || text.includes('shaam') || text.includes('raat') || text.includes('sayamkalam')) {
      slot = 'evening';
    }

    let targetMed: string | undefined;
    if (text.includes('telma') || text.includes('telmisartan') || text.includes('bp')) targetMed = 'Telmisartan';
    else if (text.includes('glycomet') || text.includes('metformin') || text.includes('sugar')) targetMed = 'Metformin';
    else if (text.includes('rosuvas') || text.includes('cholesterol')) targetMed = 'Rosuvastatin';
    else if (text.includes('shelcal') || text.includes('calcium')) targetMed = 'Shelcal';
    else if (text.includes('ecosprin') || text.includes('aspirin')) targetMed = 'Ecosprin';
    else if (text.includes('pan') || text.includes('gas')) targetMed = 'Pantoprazole';

    return {
      action: 'confirm_taken',
      targetMedication: targetMed,
      slot,
      rawTranscript: transcript,
    };
  }

  // Asking what to take / reading schedule
  if (
    text.includes('what should i take') ||
    text.includes('read') ||
    text.includes('schedule') ||
    text.includes('my pills') ||
    text.includes('medicine') ||
    text.includes('what do i take') ||
    text.includes('kya lena hai') ||
    text.includes('kaunsi goli') ||
    text.includes('emi teeskovaali') ||
    text.includes('mandulu emi') ||
    text.includes('enna marunthu')
  ) {
    let slot: 'morning' | 'afternoon' | 'evening' | undefined;
    if (text.includes('morning') || text.includes('subah') || text.includes('udayam')) slot = 'morning';
    else if (text.includes('afternoon') || text.includes('dopahar') || text.includes('madhyanam')) slot = 'afternoon';
    else if (text.includes('evening') || text.includes('night') || text.includes('shaam') || text.includes('raat')) slot = 'evening';

    return {
      action: 'read_schedule',
      slot,
      rawTranscript: transcript,
    };
  }

  // Doctor / appointment query
  if (
    text.includes('appointment') ||
    text.includes('doctor') ||
    text.includes('visit') ||
    text.includes('clinic') ||
    text.includes('hospital') ||
    text.includes('kab jaana') ||
    text.includes('eppudu vellali')
  ) {
    return {
      action: 'query_appointment',
      rawTranscript: transcript,
    };
  }

  return {
    action: 'unknown',
    rawTranscript: transcript,
  };
}
