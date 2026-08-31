import { tokenizeWords, generateNgrams } from './tokenizer';

export interface TfIdfVector {
  [term: string]: number;
}

export class TfIdfEngine {
  private vocabulary: Map<string, number> = new Map();
  private idfMap: Map<string, number> = new Map();
  private docCount: number = 0;

  /**
   * Fits the TF-IDF model on a corpus of text documents / sentences.
   */
  public fit(corpus: string[]): void {
    this.vocabulary.clear();
    this.idfMap.clear();
    this.docCount = corpus.length;

    const docFreq: Map<string, number> = new Map();

    corpus.forEach((doc) => {
      const tokens = tokenizeWords(doc);
      const bigrams = generateNgrams(tokens, 2);
      const allTerms = new Set([...tokens, ...bigrams]);

      allTerms.forEach((term) => {
        docFreq.set(term, (docFreq.get(term) || 0) + 1);
      });
    });

    let index = 0;
    docFreq.forEach((df, term) => {
      this.vocabulary.set(term, index++);
      // Standard smooth IDF formula
      const idf = Math.log((1 + this.docCount) / (1 + df)) + 1.0;
      this.idfMap.set(term, idf);
    });
  }

  /**
   * Transforms a single document / sentence into a normalized TF-IDF vector.
   */
  public transform(text: string): TfIdfVector {
    const tokens = tokenizeWords(text);
    const bigrams = generateNgrams(tokens, 2);
    const allTerms = [...tokens, ...bigrams];

    const tf: Map<string, number> = new Map();
    allTerms.forEach((term) => {
      tf.set(term, (tf.get(term) || 0) + 1);
    });

    const vector: TfIdfVector = {};
    let normSq = 0;

    tf.forEach((count, term) => {
      const idf = this.idfMap.get(term) || (Math.log(1 + this.docCount) + 1.0);
      // Sublinear term frequency scaling: 1 + log(tf)
      const sublinearTf = 1 + Math.log(count);
      const weight = sublinearTf * idf;
      vector[term] = weight;
      normSq += weight * weight;
    });

    // L2 normalize vector
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      Object.keys(vector).forEach((term) => {
        vector[term] = vector[term] / norm;
      });
    }

    return vector;
  }

  /**
   * Calculates cosine similarity between two documents directly with the fitted corpus.
   */
  public calculateSimilarity(textA: string, textB: string): number {
    const vecA = this.transform(textA);
    const vecB = this.transform(textB);
    return computeSparseCosineSimilarity(vecA, vecB);
  }
}

/**
 * Computes cosine similarity between two sparse normalized vectors.
 */
export function computeSparseCosineSimilarity(vecA: TfIdfVector, vecB: TfIdfVector): number {
  let dotProduct = 0;
  
  // Iterate over smaller vector for performance
  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);
  
  if (keysA.length === 0 || keysB.length === 0) return 0.0;

  const [smaller, larger] = keysA.length < keysB.length ? [vecA, vecB] : [vecB, vecA];

  for (const term in smaller) {
    if (larger[term] !== undefined) {
      dotProduct += smaller[term] * larger[term];
    }
  }

  // Clip between 0 and 1
  return Math.min(1.0, Math.max(0.0, dotProduct));
}

/**
 * Calculates fast Jaccard similarity between token sets (for exact n-gram overlap).
 */
export function calculateJaccardSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(tokenizeWords(textA, false));
  const tokensB = new Set(tokenizeWords(textB, false));

  if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
  if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

  let intersectionCount = 0;
  tokensA.forEach(token => {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  });

  const unionCount = tokensA.size + tokensB.size - intersectionCount;
  return unionCount === 0 ? 0.0 : intersectionCount / unionCount;
}
