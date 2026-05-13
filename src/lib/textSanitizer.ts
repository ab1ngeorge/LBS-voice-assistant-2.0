/**
 * Text sanitizer utilities for TTS (text-to-speech).
 * Strips characters that should not be spoken aloud, such as emojis.
 */

// Comprehensive regex covering all Unicode emoji ranges:
// - Emoticons, Dingbats, Symbols, Transport/Map, Misc Symbols
// - Supplemental Symbols, Enclosed Alphanumerics, Regional Indicators
// - Skin-tone modifiers, Variation selectors, ZWJ sequences
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}\u{26AB}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}\u{1F17F}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}\u{1F251}\u{203C}\u{2049}\u{1F004}\u{1F0CF}\u{00A9}\u{00AE}\u{2122}\u{2139}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;

/**
 * Remove emojis from text so TTS engines don't try to speak them.
 * Collapses any leftover double-spaces caused by removal.
 */
export function stripEmojisForTTS(text: string): string {
  return text
    .replace(EMOJI_REGEX, '')
    .replace(/  +/g, ' ')   // collapse double spaces
    .trim();
}
