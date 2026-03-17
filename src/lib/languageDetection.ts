// Simple language detection for Malayalam, English, and Manglish

// Malayalam Unicode range: U+0D00 to U+0D7F
const MALAYALAM_REGEX = /[\u0D00-\u0D7F]/;

// Common English words that might appear in Manglish
const COMMON_ENGLISH_WORDS = /\b(the|is|are|was|were|what|when|where|how|why|can|will|do|does|have|has|about|please|thank|hello|hi|yes|no|ok|okay)\b/i;

export type DetectedLanguage = 'malayalam' | 'english' | 'manglish';

/**
 * Detects the language of the input text
 * - 'malayalam': Primarily Malayalam script
 * - 'english': Primarily English
 * - 'manglish': Mix of Malayalam script and English, or transliterated Malayalam
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || !text.trim()) {
    return 'english';
  }

  const trimmedText = text.trim();

  // Count Malayalam characters
  const malayalamChars = (trimmedText.match(MALAYALAM_REGEX) || []).length;
  const totalChars = trimmedText.replace(/\s/g, '').length;
  const malayalamRatio = totalChars > 0 ? malayalamChars / totalChars : 0;

  // Check for common English words
  const hasEnglishWords = COMMON_ENGLISH_WORDS.test(trimmedText);

  // Check for Malayalam words written in English (common transliterations)
  const malayalamTransliterations = /\b(ente|ninte|avante|aval|avan|ivide|evide|ningal|njan|njangal|athu|ithu|enthu|entha|alle|aano|aan|illa|und|undo|vare|pole|kollam|mathi|pakshe|pinne|appol|ennalu|orupad|valare|adipoli|pwoli|mone|mole|cheta|chechi|eda|edi|ethra|eniku|collegil|eppol|samayam|ariyumo|parayumo|nokkumo|cheyyanam|poyikkotte|evidaanu|ariyaamoo|parayu|cheyyu|ishtam|vendaam|onnum|kurachu|nalla|nannayi|pattuo|pattilla|kittumo|kittum|pokunnu|varunnu|pidikkum|parayaam|vilikkoo|chodikkoo|tharumo|tharam|aanu|alla|enne|enik|ninaku|evidunnu|evidekku|evideyanu|evideyaa|cheythu|cheyyuka|ariyilla|ariyam|venda|veno|venam|pore|potte|sherikkum|sheriyanu|thanne|anno|ille|undu|illallo|allenkil|athupole|ippo|appo|ennitt|entho|enthoru|enthaanu|evidennu|evidekk|evidenna|paranjath|parayoo|nokkoo|nokku|mwone|mwol)\b/i;
  const hasManglishWords = malayalamTransliterations.test(trimmedText);

  // If more than 60% Malayalam script, it's Malayalam
  if (malayalamRatio > 0.6) {
    return 'malayalam';
  }

  // If has Malayalam script mixed with English, it's Manglish
  if (malayalamRatio > 0.1 && malayalamRatio <= 0.6) {
    return 'manglish';
  }

  // If has Malayalam script (even small amount) with English words
  if (malayalamRatio > 0 && hasEnglishWords) {
    return 'manglish';
  }

  // If has transliterated Malayalam words, it's Manglish
  if (hasManglishWords) {
    return 'manglish';
  }

  // If no Malayalam script and no transliterations, it's English
  return 'english';
}

/**
 * Returns the language instruction for the AI prompt
 */
export function getLanguageInstruction(language: DetectedLanguage): string {
  switch (language) {
    case 'malayalam':
      return 'Respond entirely in Malayalam script (മലയാളം). Use Malayalam words and sentences.';
    case 'manglish':
      return 'Respond in Manglish - casual mix of Malayalam and English. Feel free to use both Malayalam script and English transliterations.';
    case 'english':
    default:
      return 'Respond in English in a friendly, helpful manner.';
  }
}
