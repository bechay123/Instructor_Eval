// Profanity filter for Philippine languages and English
// Prevents inappropriate language in student evaluation comments

/**
 * Profanity lists for each supported language
 * Note: This is a basic list. You may need to expand based on local usage.
 */
const profanityLists = {
  en: [
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'bastard', 'dick', 'pussy', 'cock',
    'cunt', 'whore', 'slut', 'piss', 'asshole', 'motherfucker', 'fck', 'bullshit'
  ],
  tl: [
    'putang ina', 'tangina', 'gago', 'puta', 'tarantado', 'ulol', 'bobo', 'tanga',
    'hayop', 'leche', 'shit', 'fuck', 'kingina', 'potangina', 'hindot', 'kantot',
    'tamod', 'puki', 'titi', 'bayag', 'bilat', 'burat', 'jakol'
  ],
  ceb: [
    'yawa', 'atay', 'piste', 'buang', 'animal', 'anak sa yawa', 'puta', 'yawaa',
    'pesteng yawa', 'bugo', 'ulol', 'burikat', 'bilat', 'utin', 'boto', 'kantot'
  ],
  hil: [
    'yawa', 'buang', 'tarantado', 'puta', 'gago', 'ulol', 'animal', 'peste',
    'hindot', 'bilat', 'boto', 'utin', 'tamod', 'kantot'
  ],
  mrw: [
    'yawa', 'buang', 'gago', 'puta', 'tarantado', 'animal', 'ulol', 'peste'
  ]
};

/**
 * Common swear word patterns across languages (case-insensitive regex)
 */
const profanityPatterns = [
  /p[ou]tang\s*ina/gi,
  /tang\s*ina/gi,
  /anak\s*ng/gi,
  /pest[ei]ng/gi,
  /f+[u\*]+c+k+/gi,
  /s+h+[i\*]+t+/gi,
  /b+[i\*]+t+c+h+/gi,
  /a+s+s+h+o+l+e+/gi,
  /m+o+t+h+e+r+f+[u\*]+c+k+e+r+/gi
];

/**
 * Normalize text for comparison (remove spaces, special chars, case)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Check if text contains profanity
 * @param text - The text to check
 * @param language - The language code (en, tl, ceb, hil, mrw)
 * @returns Object with isProfane flag and matched words
 */
export function checkProfanity(text: string, language: string = 'en'): {
  isProfane: boolean;
  matchedWords: string[];
  sanitizedText?: string;
} {
  if (!text || !text.trim()) {
    return { isProfane: false, matchedWords: [] };
  }

  const normalized = normalizeText(text);
  const lowerText = text.toLowerCase();
  const matchedWords: string[] = [];

  // Check pattern-based profanity (works across all languages)
  for (const pattern of profanityPatterns) {
    const matches = lowerText.match(pattern);
    if (matches) {
      matchedWords.push(...matches);
    }
  }

  // Check language-specific word list
  const wordList = profanityLists[language as keyof typeof profanityLists] || [];
  for (const word of wordList) {
    const normalizedWord = normalizeText(word);
    
    // Check if word appears in normalized text
    if (normalized.includes(normalizedWord)) {
      matchedWords.push(word);
    }
    
    // Also check original text for exact matches
    if (lowerText.includes(word.toLowerCase())) {
      matchedWords.push(word);
    }
  }

  // Check all language lists (students might mix languages)
  for (const [lang, words] of Object.entries(profanityLists)) {
    if (lang === language) continue; // Already checked above
    
    for (const word of words) {
      const normalizedWord = normalizeText(word);
      if (normalized.includes(normalizedWord) || lowerText.includes(word.toLowerCase())) {
        matchedWords.push(word);
      }
    }
  }

  // Remove duplicates
  const uniqueMatches = [...new Set(matchedWords)];

  return {
    isProfane: uniqueMatches.length > 0,
    matchedWords: uniqueMatches
  };
}

/**
 * Get user-friendly error message for profanity detection
 */
export function getProfanityErrorMessage(language: string = 'en'): string {
  const messages = {
    en: 'Your comment contains inappropriate language. Please keep your feedback professional and respectful.',
    tl: 'Ang iyong komento ay naglalaman ng hindi angkop na wika. Mangyaring panatilihing propesyonal at magalang ang iyong feedback.',
    ceb: 'Ang imong komento adunay dili angay nga mga pulong. Palihug nga magpabilin nga propesyonal ug matinahuron ang imong feedback.',
    hil: 'Ang imo komento may ara nga indi angay nga mga pulong. Palihog nga magpabilin nga propesyonal kag matinahuron ang imo feedback.',
    mrw: 'So inyong komento anggagabay manga diri angay a taroan. Pakitabanga legen a propesyonal ago matinabangon so inyong feedback.'
  };

  return messages[language as keyof typeof messages] || messages.en;
}
