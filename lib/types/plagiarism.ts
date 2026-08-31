export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type MatchCategory = 'EXACT' | 'PARAPHRASED' | 'MODERATE' | 'LOW' | 'NONE';

export interface SentenceMatch {
  sourceIndex: number;
  sourceText: string;
  targetIndex: number;
  targetText: string;
  tfidfScore: number;       // 0 to 1
  semanticScore: number;    // 0 to 1
  hybridScore: number;      // 0 to 1
  category: MatchCategory;
}

export interface DocumentStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  uniqueWords: number;
}

export interface PlagiarismReport {
  id: string;
  titleA: string;
  titleB: string;
  createdAt: string;
  statsA: DocumentStats;
  statsB: DocumentStats;
  
  // Aggregate Scores (0 to 100)
  overallScore: number;
  exactScore: number;
  semanticScore: number;
  riskLevel: RiskLevel;
  
  // Sentence-level breakdown
  sentencesA: string[];
  sentencesB: string[];
  matchesAtoB: SentenceMatch[];
  
  // Detailed Distribution for charts
  similarityDistribution: {
    exactCount: number;
    paraphrasedCount: number;
    moderateCount: number;
    lowCount: number;
  };

  // Top similar pairs for quick insights
  topMatches: SentenceMatch[];
  
  // Explanations for human readability
  summaryInsight: string;
}

export interface AnalysisRequest {
  docA: {
    name?: string;
    text: string;
  };
  docB: {
    name?: string;
    text: string;
  };
  options?: {
    exactThreshold?: number;     // e.g. 0.85
    semanticThreshold?: number;  // e.g. 0.75
    hybridWeight?: number;       // 0.4 TFIDF + 0.6 SBERT
  };
}
