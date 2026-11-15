/**
 * Browser Web Speech API service for CareCircle
 * Provides calm, natural Text-to-Speech (TTS) in Indian Native Languages
 * (Hindi, Telugu, Tamil, Indian English) and multilingual intent recognition.
 * 
 * Strict Language & Voice Isolation:
 * Prevents voice cross-talk, eliminates Chrome's silent redirection of unbundled
 * regional languages to Hindi, and enforces strict voice engine boundaries.
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
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  public static setLanguage(lang: NativeLanguage): void {
    this.currentLang = lang;
    this.stop();
  }

  public static getLanguage(): NativeLanguage {
    return this.currentLang;
  }

  public static initVoice(): void {
    if (!this.synth || this.isInitialized) return;
    this.isInitialized = true;

    const loadVoices = () => {
      if (!this.synth) return;
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
      }
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  private static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    if (this.synth) {
      this.cachedVoices = this.synth.getVoices() || [];
    }
    return this.cachedVoices;
  }

  /**
   * Strictly isolates voices per language to prevent cross-contamination.
   * Hindi voices can NEVER be assigned to Telugu or English.
   */
  public static selectBestVoice(targetLang: NativeLanguage): {
    voice: SpeechSynthesisVoice | null;
    isNative: boolean;
    speechLang: string;
  } {
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) {
      return {
        voice: null,
        isNative: false,
        speechLang: targetLang === 'hi' ? 'hi-IN' : targetLang === 'te' ? 'te-IN' : targetLang === 'ta' ? 'ta-IN' : 'en-IN',
      };
    }

    // --- TELUGU ---
    if (targetLang === 'te') {
      // 1. Check for genuine Telugu voice (e.g. Edge: Microsoft Mohan/Shruti)
      const teluguVoice = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('te') || vn.includes('telugu');
      });

      if (teluguVoice) {
        return {
          voice: teluguVoice,
          isNative: true,
          speechLang: teluguVoice.lang || 'te-IN',
        };
      }

      // 2. Fallback when browser lacks native Telugu (Standard Chrome on Windows):
      // STRICT RULE: Must be a pure ENGLISH voice. EXCLUDE any voice containing 'hindi' or 'hi-IN'!
      const pureEnglishIndian = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return (
          vl.startsWith('en') &&
          !vl.startsWith('hi') &&
          !vn.includes('hindi') &&
          (vl === 'en-in' || vn.includes('neerja') || vn.includes('prabhat') || vn.includes('heera'))
        );
      });

      if (pureEnglishIndian) {
        return {
          voice: pureEnglishIndian,
          isNative: false,
          speechLang: 'en-IN',
        };
      }

      // 3. Fallback to any natural English voice (never Hindi)
      const pureEnglishNatural = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('en') && !vl.startsWith('hi') && !vn.includes('hindi') && (vn.includes('natural') || vn.includes('google'));
      });

      if (pureEnglishNatural) {
        return {
          voice: pureEnglishNatural,
          isNative: false,
          speechLang: pureEnglishNatural.lang || 'en-US',
        };
      }

      const anyEnglish = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('en') && !vl.startsWith('hi') && !vn.includes('hindi');
      });

      return {
        voice: anyEnglish || null,
        isNative: false,
        speechLang: 'en-US',
      };
    }

    // --- HINDI ---
    if (targetLang === 'hi') {
      const hindiNatural = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return (vl.startsWith('hi') || vn.includes('hindi')) && (vn.includes('natural') || vn.includes('online'));
      });

      if (hindiNatural) {
        return { voice: hindiNatural, isNative: true, speechLang: hindiNatural.lang || 'hi-IN' };
      }

      const anyHindi = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('hi') || vn.includes('hindi') || vn.includes('google हिन्दी');
      });

      return { voice: anyHindi || null, isNative: true, speechLang: anyHindi?.lang || 'hi-IN' };
    }

    // --- TAMIL ---
    if (targetLang === 'ta') {
      const tamilVoice = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('ta') || vn.includes('tamil');
      });

      if (tamilVoice) {
        return { voice: tamilVoice, isNative: true, speechLang: tamilVoice.lang || 'ta-IN' };
      }

      // English fallback
      const enVoice = voices.find(v => {
        const vl = (v.lang || '').replace('_', '-').toLowerCase();
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('en') && !vl.startsWith('hi') && !vn.includes('hindi');
      });

      return { voice: enVoice || null, isNative: false, speechLang: 'en-IN' };
    }

    // --- ENGLISH ---
    const enIndianNatural = voices.find(v => {
      const vl = (v.lang || '').replace('_', '-').toLowerCase();
      const vn = (v.name || '').toLowerCase();
      return (
        vl.startsWith('en') &&
        !vl.startsWith('hi') &&
        !vn.includes('hindi') &&
        (vl === 'en-in' || vn.includes('neerja') || vn.includes('prabhat')) &&
        (vn.includes('natural') || vn.includes('online'))
      );
    });

    if (enIndianNatural) {
      return { voice: enIndianNatural, isNative: true, speechLang: enIndianNatural.lang || 'en-IN' };
    }

    const anyEn = voices.find(v => {
      const vl = (v.lang || '').replace('_', '-').toLowerCase();
      const vn = (v.name || '').toLowerCase();
      return vl.startsWith('en') && !vl.startsWith('hi') && !vn.includes('hindi');
    });

    return { voice: anyEn || null, isNative: true, speechLang: anyEn?.lang || 'en-IN' };
  }

  /**
   * Speak a text string with comfortable, natural cadence in chosen Indian language.
   * Guarantees:
   * 1. Never passes Hindi voices to Telugu or English.
   * 2. If browser lacks Telugu TTS (Chrome), sets utterance.lang to 'en-IN' to prevent Chrome
   *    from silently forcing the Hindi engine, and speaks the phonetic text cleanly.
   */
  public static speak(
    text: string,
    options: {
      lang?: NativeLanguage;
      phoneticFallbackText?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        options.onEnd?.();
        resolve();
        return;
      }

      this.stop(); // Stop any active speech

      const targetLang = options.lang || this.currentLang;
      const { voice, isNative, speechLang } = this.selectBestVoice(targetLang);

      // Determine text and speech language
      let utteranceText = text;
      let finalSpeechLang = speechLang;

      if (targetLang === 'te') {
        if (!isNative) {
          // No native Telugu voice in Chrome:
          // CRITICAL: Force speechLang = 'en-IN' so Chrome doesn't fall back to Hindi!
          finalSpeechLang = 'en-IN';
          utteranceText = options.phoneticFallbackText || text;
        } else {
          // Native Telugu voice exists (e.g. Edge)
          finalSpeechLang = 'te-IN';
          utteranceText = text;
        }
      } else if (targetLang === 'ta') {
        if (!isNative) {
          finalSpeechLang = 'en-IN';
          utteranceText = options.phoneticFallbackText || text;
        } else {
          finalSpeechLang = 'ta-IN';
          utteranceText = text;
        }
      } else if (targetLang === 'hi') {
        finalSpeechLang = 'hi-IN';
        utteranceText = text;
      } else {
        finalSpeechLang = 'en-IN';
        utteranceText = text;
      }

      const utterance = new SpeechSynthesisUtterance(utteranceText);
      utterance.lang = finalSpeechLang;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = options.rate ?? 0.88;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis event:', e);
        options.onEnd?.();
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
