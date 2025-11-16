// Translation service for Philippine languages
export type SupportedLanguage = 'en' | 'tl' | 'ceb' | 'hil' | 'mrw';

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'hil', name: 'Hiligaynon', nativeName: 'Hiligaynon' },
  { code: 'mrw', name: 'Maranao', nativeName: 'Mëranaw' },
] as const;

// Placeholder text translations
export const placeholders = {
  teaching_comments: {
    en: "Share your thoughts about the instructor's teaching effectiveness...",
    tl: "Ibahagi ang iyong pananaw tungkol sa pagtuturo ng instruktor...",
    ceb: "Ipaambit ang imong mga hunahuna bahin sa pagtudlo sa instruktor...",
    hil: "Ipakigbahin ang imo mga hunahuna parte sa pagtudlo sang instruktor...",
    mrw: "Ipakabagi so inyong manga pagiisip paratomon so pagtotoro o instruktur..."
  },
  materials_comments: {
    en: "Share your thoughts about the learning materials provided...",
    tl: "Ibahagi ang iyong pananaw tungkol sa mga kagamitang pang-aral na ibinigay...",
    ceb: "Ipaambit ang imong mga hunahuna bahin sa mga materyal sa pagkat-on nga gihatag...",
    hil: "Ipakigbahin ang imo mga hunahuna parte sa mga materyales nga ginhatag...",
    mrw: "Ipakabagi so inyong manga pagiisip paratomon so manga materyales a siningay..."
  },
  communication_comments: {
    en: "Share your thoughts about the instructor's communication and accessibility...",
    tl: "Ibahagi ang iyong pananaw tungkol sa komunikasyon at kakayahang makontak ng instruktor...",
    ceb: "Ipaambit ang imong mga hunahuna bahin sa komunikasyon ug pagka-accessible sa instruktor...",
    hil: "Ipakigbahin ang imo mga hunahuna parte sa komunikasyon kag accessibility sang instruktor...",
    mrw: "Ipakabagi so inyong manga pagiisip paratomon so komunikasyon ago accessibility o instruktur..."
  },
  general_comments: {
    en: "Any additional feedback about this instructor...",
    tl: "Anumang karagdagang puna tungkol sa instruktor na ito...",
    ceb: "Bisan unsang dugang nga feedback bahin niining instruktor...",
    hil: "Bisan ano pa nga dugang nga feedback parte sini nga instruktor...",
    mrw: "Misan onopa manga kaiyanay a feedback paratomon so instruktur aya..."
  }
};

export const uiText = {
  languageLabel: {
    en: "Comment Language",
    tl: "Wika ng Komento",
    ceb: "Pinulongan sa Komento",
    hil: "Pinulongan sang Komento",
    mrw: "Taroan o Komento"
  },
  translationNote: {
    en: "Your comment will be automatically translated to English for the instructor.",
    tl: "Ang iyong komento ay awtomatikong isasalin sa Ingles para sa instruktor.",
    ceb: "Ang imong komento awtomatiko nga hubaron sa English para sa instruktor.",
    hil: "Ang imo komento awtomatiko nga hubalaron sa English para sa instruktor.",
    mrw: "So inyong komento awtomatiko a babasahon so English para o instruktur."
  },
  originalComment: {
    en: "Original Comment",
    tl: "Orihinal na Komento",
    ceb: "Orihinal nga Komento",
    hil: "Orihinal nga Komento",
    mrw: "Poon a Komento"
  },
  translatedComment: {
    en: "Translated to English",
    tl: "Isinalin sa Ingles",
    ceb: "Gihubad sa English",
    hil: "Ginhubalaron sa English",
    mrw: "Binabasahon so English"
  }
};

/**
 * Language code mapping for translation API
 */
const languageCodeMap: Record<SupportedLanguage, string> = {
  'en': 'en',
  'tl': 'tl',
  'ceb': 'ceb',
  'hil': 'hil',
  'mrw': 'mrw'
};

/**
 * Translates text to English using free LibreTranslate API
 * Falls back to MyMemory Translation API if LibreTranslate fails
 * No API key required!
 */
export async function translateToEnglish(text: string, sourceLang: SupportedLanguage): Promise<string> {
  if (sourceLang === 'en' || !text.trim()) {
    return text;
  }

  try {
    // First try: LibreTranslate (completely free, no API key needed)
    // Using public instance at libretranslate.com
    const libreTranslateUrl = 'https://libretranslate.com/translate';
    
    const response = await fetch(libreTranslateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: languageCodeMap[sourceLang],
        target: 'en',
        format: 'text'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.translatedText) {
        return data.translatedText;
      }
    }

    // Fallback: MyMemory Translation API (free, no registration needed)
    // Limit: 5000 chars/request, 1000 requests/day
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${languageCodeMap[sourceLang]}|en`;
    
    const fallbackResponse = await fetch(myMemoryUrl);
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.responseData?.translatedText) {
        return fallbackData.responseData.translatedText;
      }
    }

    throw new Error('All translation services failed');
    
  } catch (error) {
    console.error('Translation error:', error);
    // Final fallback: return original text with language indicator
    const langName = languages.find(l => l.code === sourceLang)?.name || sourceLang;
    return `[Original in ${langName}]: ${text}`;
  }
}

