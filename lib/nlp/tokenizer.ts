// Common English Stopwords
export const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

const ABBREVIATIONS = [
  'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr', 'vs', 'etc', 'e.g', 'i.e', 'al', 'fig', 'no', 'vol', 'dept',
  'inc', 'ltd', 'co', 'corp', 'univ', 'approx', 'est'
];

/**
 * Splits text into well-formed sentences using heuristic boundary detection.
 */
export function splitSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Normalize line endings and multiple spaces
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!cleaned) return [];

  // Protect abbreviations and decimal numbers temporarily
  let masked = cleaned;
  const placeholders: { [key: string]: string } = {};
  let pIdx = 0;

  // Protect decimals like 3.14 or $19.99
  masked = masked.replace(/(\d+)\.(\d+)/g, (match) => {
    const key = `__DEC_${pIdx++}__`;
    placeholders[key] = match;
    return key;
  });

  // Protect abbreviations
  ABBREVIATIONS.forEach(abbr => {
    const regex = new RegExp(`\\b(${abbr})\\.(\\s+)`, 'gi');
    masked = masked.replace(regex, (match, prefix, space) => {
      const key = `__ABBR_${pIdx++}__`;
      placeholders[key] = `${prefix}.${space}`;
      return key;
    });
  });

  // Protect ellipsis
  masked = masked.replace(/\.{3}/g, () => {
    const key = `__ELLIP_${pIdx++}__`;
    placeholders[key] = '...';
    return key;
  });

  // Split on sentence boundaries: (. | ! | ? | \n+) followed by space, quote, or end of string
  const rawSegments = masked.split(/(?<=[.!?\n])\s+(?=[A-Z0-9"'\u201C\u2018])/);

  const sentences: string[] = [];

  for (let segment of rawSegments) {
    // If segment has multiple newlines, split on paragraphs
    const subSegments = segment.split(/\n{2,}/);
    for (let sub of subSegments) {
      // Restore placeholders
      let restored = sub;
      for (const [k, v] of Object.entries(placeholders)) {
        restored = restored.split(k).join(v);
      }
      const trimmed = restored.replace(/\s+/g, ' ').trim();
      if (trimmed.length > 2) {
        sentences.push(trimmed);
      }
    }
  }

  return sentences.length > 0 ? sentences : [cleaned];
}

/**
 * Tokenizes a sentence into lowercase alphabetic words.
 */
export function tokenizeWords(text: string, removeStopwords = true): string[] {
  if (!text) return [];
  
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !/^\d+$/.test(token));

  if (!removeStopwords) {
    return tokens;
  }

  return tokens.filter(t => !ENGLISH_STOPWORDS.has(t));
}

/**
 * Generates n-grams from a list of tokens.
 */
export function generateNgrams(tokens: string[], n = 2): string[] {
  if (tokens.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join('_'));
  }
  return ngrams;
}

/**
 * Extracts basic document statistics.
 */
export function getDocumentStats(text: string, sentences: string[]) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const uniqueWordSet = new Set(words.map(w => w.toLowerCase()));

  return {
    charCount: text.length,
    wordCount: words.length,
    sentenceCount: sentences.length,
    uniqueWords: uniqueWordSet.size
  };
}
