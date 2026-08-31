// Sentence-BERT Embedding Engine using @xenova/transformers

let pipelineInstance: any = null;
let pipelinePromise: Promise<any> | null = null;

/**
 * Initializes the Transformers.js feature extraction pipeline.
 * Uses all-MiniLM-L6-v2 quantized model (approx 23MB ONNX model).
 */
export async function getEmbeddingPipeline() {
  if (pipelineInstance) {
    return pipelineInstance;
  }

  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      try {
        // Prevent sharp native binary error on Windows for NLP pipelines
        try {
          if (typeof require !== 'undefined' && !require.cache['sharp']) {
            require.cache['sharp'] = {
              id: 'sharp',
              filename: 'sharp',
              loaded: true,
              exports: {},
              path: '',
              children: [],
              paths: []
            } as any;
          }
        } catch (_) {}

        const { pipeline, env } = await import('@xenova/transformers');
        
        // Optimize cache and environment settings for serverless & local runtime
        env.allowLocalModels = false;
        env.useBrowserCache = false;

        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          quantized: true,
        });
        pipelineInstance = extractor;
        return pipelineInstance;
      } catch (err) {
        console.warn('Failed to load @xenova/transformers pipeline, using fallback embeddings:', err);
        return null;
      }
    })();
  }

  return pipelinePromise;
}

/**
 * Normalizes a vector to unit length (L2 norm).
 */
export function l2Normalize(vec: number[] | Float32Array): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return Array.from(vec);
  const normalized: number[] = new Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    normalized[i] = vec[i] / norm;
  }
  return normalized;
}

/**
 * Computes Cosine Similarity between two dense numeric vectors.
 */
export function computeDenseCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0.0;
  }

  let dotProduct = 0;
  let normASq = 0;
  let normBSq = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normASq += vecA[i] * vecA[i];
    normBSq += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normASq) * Math.sqrt(normBSq);
  if (denominator === 0) return 0.0;

  const sim = dotProduct / denominator;
  return Math.min(1.0, Math.max(0.0, sim));
}

/**
 * Generates Sentence-BERT embeddings for a list of sentences.
 */
export async function generateEmbeddings(sentences: string[]): Promise<number[][]> {
  if (sentences.length === 0) return [];

  const extractor = await getEmbeddingPipeline();

  if (extractor) {
    try {
      const embeddings: number[][] = [];
      
      // Batch process sentences
      for (const sentence of sentences) {
        const output = await extractor(sentence, { pooling: 'mean', normalize: true });
        const vector = Array.from(output.data as Float32Array);
        embeddings.push(vector);
      }
      
      return embeddings;
    } catch (error) {
      console.warn('Error during transformer embedding extraction:', error);
    }
  }

  // Resilient fallback: character-frequency and word-hash pseudo-embeddings
  return sentences.map(sentence => generateFallbackEmbedding(sentence));
}

/**
 * Fallback lightweight semantic vector generator when ONNX model is initializing or unreachable.
 */
function generateFallbackEmbedding(text: string, dim = 128): number[] {
  const vec = new Array(dim).fill(0);
  const cleaned = text.toLowerCase().trim();
  
  for (let i = 0; i < cleaned.length; i++) {
    const charCode = cleaned.charCodeAt(i);
    const pos = (charCode * 31 + i * 17) % dim;
    vec[pos] += 1;
  }

  const words = cleaned.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    let hash = 0;
    for (let c = 0; c < words[i].length; c++) {
      hash = (hash << 5) - hash + words[i].charCodeAt(c);
      hash |= 0;
    }
    const pos = Math.abs(hash) % dim;
    vec[pos] += 2.0;
  }

  return l2Normalize(vec);
}
