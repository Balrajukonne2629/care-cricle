/**
 * Browser Web Speech API service for CareCircle
 * Provides calm, natural Text-to-Speech (TTS) in Indian Native Languages
 * (Hindi, Telugu, Tamil, Indian English) and multilingual intent recognition.
 * 
 * Includes intelligent voice matching prioritizing high-clarity Natural / Neural voices
 * and seamless phonetic fallback for browsers lacking native Telugu/Tamil speech engines.
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
   * Selects the highest quality natural voice for a language.
   * Priority: Natural / Neural / Online > Google > Language match.
   * If a browser lacks a native engine (e.g. Chrome on Windows without Telugu TTS),
   * returns isNative = false so caller can use phonetic Indian English speech.
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

    const langCode = targetLang === 'hi' ? 'hi' : targetLang === 'te' ? 'te' : targetLang === 'ta' ? 'ta' : 'en';

    // 1. Search for native voices matching the language code (e.g., te-IN, hi-IN)
    const nativeMatches = voices.filter(v => {
      const vLang = (v.lang || '').replace('_', '-').toLowerCase();
      const vName = (v.name || '').toLowerCase();
      return vLang.startsWith(langCode) || vName.includes(
        targetLang === 'te' ? 'telugu' : targetLang === 'hi' ? 'hindi' : targetLang === 'ta' ? 'tamil' : 'english'
      );
    });

    if (nativeMatches.length > 0) {
      // Pick best quality (Natural/Online > Google > first available)
      const best = nativeMatches.find(v => v.name.includes('Natural') || v.name.includes('Online'))
        || nativeMatches.find(v => v.name.includes('Google'))
        || nativeMatches[0];

      return {
        voice: best,
        isNative: true,
        speechLang: best.lang || `${langCode}-IN`,
      };
    }

    // 2. Fallback for Telugu / Tamil when browser does NOT bundle that voice:
    // Route to Indian English voice (en-IN) to prevent Chrome from defaulting to Hindi!
    const indianEnglishVoices = voices.filter(v => {
      const vLang = (v.lang || '').replace('_', '-').toLowerCase();
      const vName = (v.name || '').toLowerCase();
      return (
        vLang === 'en-in' ||
        vName.includes('india') ||
        vName.includes('neerja') ||
        vName.includes('prabhat') ||
        vName.includes('heera')
      );
    });

    if (indianEnglishVoices.length > 0) {
      const bestInEn = indianEnglishVoices.find(v => v.name.includes('Natural') || v.name.includes('Online'))
        || indianEnglishVoices.find(v => v.name.includes('Google'))
        || indianEnglishVoices[0];

      return {
        voice: bestInEn,
        isNative: false,
        speechLang: 'en-IN',
      };
    }

    // 3. Fallback to any Natural / High-quality English voice
    const naturalEnglish = voices.find(v => (v.lang || '').startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
    if (naturalEnglish) {
      return {
        voice: naturalEnglish,
        isNative: false,
        speechLang: naturalEnglish.lang || 'en-US',
      };
    }

    // 4. Default voice
    const defaultVoice = voices.find(v => (v.lang || '').startsWith('en')) || voices[0];
    return {
      voice: defaultVoice || null,
      isNative: false,
      speechLang: defaultVoice?.lang || 'en-US',
    };
  }

  /**
   * Speak a text string with comfortable, natural cadence in chosen Indian language.
   * Supports an optional phoneticFallbackText for when browser lacks native Telugu/Tamil TTS.
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

      this.stop(); // Stop any currently playing audio

      const targetLang = options.lang || this.currentLang;
      const { voice, isNative, speechLang } = this.selectBestVoice(targetLang);

      // If language is Telugu or Tamil and no native engine exists in browser,
      // use phonetic Indian English speech rather than letting Chrome read Telugu with Hindi/gibberish voice
      let utteranceText = text;
      if (!isNative && (targetLang === 'te' || targetLang === 'ta') && options.phoneticFallbackText) {
        utteranceText = options.phoneticFallbackText;
      }

      const utterance = new SpeechSynthesisUtterance(utteranceText);
      utterance.lang = speechLang;
      if (voice) {
        utterance.voice = voice;
      }

      // Natural, calm rate (0.88 - 0.92 sounds human, not rushed or robotic)
      utterance.rate = options.rate ?? (isNative ? 0.88 : 0.90);
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis notice:', e);
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
