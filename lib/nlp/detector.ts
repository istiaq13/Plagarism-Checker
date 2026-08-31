import { splitSentences, getDocumentStats } from './tokenizer';
import { TfIdfEngine, calculateJaccardSimilarity } from './tfidf';
import { generateEmbeddings, computeDenseCosineSimilarity } from './embeddings';
import { PlagiarismReport, SentenceMatch, MatchCategory, RiskLevel, AnalysisRequest } from '../types/plagiarism';

export async function analyzeDocuments(request: AnalysisRequest): Promise<PlagiarismReport> {
  const textA = request.docA.text || '';
  const textB = request.docB.text || '';
  const titleA = request.docA.name || 'Document A';
  const titleB = request.docB.name || 'Document B';

  const sentencesA = splitSentences(textA);
  const sentencesB = splitSentences(textB);

  const statsA = getDocumentStats(textA, sentencesA);
  const statsB = getDocumentStats(textB, sentencesB);

  // If either document has no content
  if (sentencesA.length === 0 || sentencesB.length === 0) {
    return {
      id: generateReportId(),
      titleA,
      titleB,
      createdAt: new Date().toISOString(),
      statsA,
      statsB,
      overallScore: 0,
      exactScore: 0,
      semanticScore: 0,
      riskLevel: 'LOW',
      sentencesA,
      sentencesB,
      matchesAtoB: [],
      similarityDistribution: { exactCount: 0, paraphrasedCount: 0, moderateCount: 0, lowCount: 0 },
      topMatches: [],
      summaryInsight: 'One or both documents contain insufficient text for comparison.'
    };
  }

  // 1. Fit TF-IDF Engine on combined corpus
  const tfidfEngine = new TfIdfEngine();
  tfidfEngine.fit([...sentencesA, ...sentencesB, textA, textB]);

  // 2. Generate SBERT Embeddings for all sentences
  const [embeddingsA, embeddingsB] = await Promise.all([
    generateEmbeddings(sentencesA),
    generateEmbeddings(sentencesB)
  ]);

  // 3. Sentence-level pairwise comparison
  const matchesAtoB: SentenceMatch[] = [];
  let exactMatchCount = 0;
  let paraphrasedCount = 0;
  let moderateCount = 0;
  let lowCount = 0;

  const exactThreshold = request.options?.exactThreshold ?? 0.80;
  const semanticThreshold = request.options?.semanticThreshold ?? 0.72;
  const hybridWeight = request.options?.hybridWeight ?? 0.40; // 40% TFIDF, 60% SBERT

  for (let i = 0; i < sentencesA.length; i++) {
    const sA = sentencesA[i];
    const embA = embeddingsA[i];
    
    let bestMatchIdx = -1;
    let bestTfidf = 0;
    let bestSemantic = 0;
    let bestHybrid = 0;

    for (let j = 0; j < sentencesB.length; j++) {
      const sB = sentencesB[j];
      const embB = embeddingsB[j];

      // Exact text check
      const isIdentical = sA.toLowerCase().trim() === sB.toLowerCase().trim();
      const jaccard = calculateJaccardSimilarity(sA, sB);
      const tfidfSim = isIdentical ? 1.0 : Math.max(jaccard, tfidfEngine.calculateSimilarity(sA, sB));
      const semanticSim = isIdentical ? 1.0 : computeDenseCosineSimilarity(embA, embB);

      const hybrid = (hybridWeight * tfidfSim) + ((1 - hybridWeight) * semanticSim);

      if (hybrid > bestHybrid || bestMatchIdx === -1) {
        bestHybrid = hybrid;
        bestTfidf = tfidfSim;
        bestSemantic = semanticSim;
        bestMatchIdx = j;
      }
    }

    // Determine categorization
    let category: MatchCategory = 'NONE';
    if (bestTfidf >= exactThreshold || (bestTfidf >= 0.70 && bestSemantic >= 0.90)) {
      category = 'EXACT';
      exactMatchCount++;
    } else if (bestSemantic >= semanticThreshold) {
      category = 'PARAPHRASED';
      paraphrasedCount++;
    } else if (bestHybrid >= 0.40) {
      category = 'MODERATE';
      moderateCount++;
    } else if (bestHybrid >= 0.15) {
      category = 'LOW';
      lowCount++;
    }

    matchesAtoB.push({
      sourceIndex: i,
      sourceText: sA,
      targetIndex: bestMatchIdx,
      targetText: sentencesB[bestMatchIdx] || '',
      tfidfScore: parseFloat(bestTfidf.toFixed(4)),
      semanticScore: parseFloat(bestSemantic.toFixed(4)),
      hybridScore: parseFloat(bestHybrid.toFixed(4)),
      category
    });
  }

  // 4. Calculate Aggregate Scores (0 to 100)
  // Exact score measures proportion of sentences heavily copied
  const exactScoreRaw = (exactMatchCount * 1.0 + paraphrasedCount * 0.3) / sentencesA.length;
  
  // Semantic score calculates average top semantic match among matched sentences
  const avgSemantic = matchesAtoB.reduce((acc, m) => acc + m.semanticScore, 0) / sentencesA.length;
  
  // Document-level whole TF-IDF score
  const docLevelTfidf = tfidfEngine.calculateSimilarity(textA, textB);

  const exactScore = Math.min(100, Math.round(Math.max(exactScoreRaw * 100, docLevelTfidf * 100)));
  const semanticScore = Math.min(100, Math.round(avgSemantic * 100));

  // Overall Score is a weighted combination
  let overallScore = Math.round(
    (0.45 * exactScore) + (0.45 * semanticScore) + (0.10 * (exactMatchCount + paraphrasedCount) / sentencesA.length * 100)
  );
  overallScore = Math.min(100, Math.max(0, overallScore));

  // Risk Classification
  let riskLevel: RiskLevel = 'LOW';
  if (overallScore >= 75 || exactScore >= 70) {
    riskLevel = 'CRITICAL';
  } else if (overallScore >= 50 || exactScore >= 45 || semanticScore >= 65) {
    riskLevel = 'HIGH';
  } else if (overallScore >= 25 || exactScore >= 20 || semanticScore >= 40) {
    riskLevel = 'MODERATE';
  }

  // Top Matches (sorted by hybrid similarity)
  const topMatches = [...matchesAtoB]
    .filter(m => m.hybridScore >= 0.25)
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, 10);

  // Generate Natural Language Summary Insight
  const summaryInsight = generateSummaryInsight(
    overallScore,
    exactScore,
    semanticScore,
    riskLevel,
    exactMatchCount,
    paraphrasedCount,
    sentencesA.length
  );

  return {
    id: generateReportId(),
    titleA,
    titleB,
    createdAt: new Date().toISOString(),
    statsA,
    statsB,
    overallScore,
    exactScore,
    semanticScore,
    riskLevel,
    sentencesA,
    sentencesB,
    matchesAtoB,
    similarityDistribution: {
      exactCount: exactMatchCount,
      paraphrasedCount,
      moderateCount,
      lowCount
    },
    topMatches,
    summaryInsight
  };
}

function generateReportId(): string {
  return 'rep_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function generateSummaryInsight(
  overall: number,
  exact: number,
  semantic: number,
  risk: RiskLevel,
  exactCount: number,
  paraphrasedCount: number,
  totalSentences: number
): string {
  const percentFlagged = Math.round(((exactCount + paraphrasedCount) / totalSentences) * 100);

  if (risk === 'CRITICAL') {
    return `Critical Plagiarism Risk (${overall}% overall similarity). ${exactCount} sentence(s) are exact or verbatim copies, and ${paraphrasedCount} sentence(s) show strong semantic paraphrasing. Approximately ${percentFlagged}% of Document A overlaps directly with Document B.`;
  }
  if (risk === 'HIGH') {
    return `High Plagiarism Risk (${overall}% overall similarity). Significant semantic overlap detected (${semantic}% semantic score). ${paraphrasedCount} sentence(s) appear paraphrased while preserving conceptual structure.`;
  }
  if (risk === 'MODERATE') {
    return `Moderate Similarity (${overall}% overall similarity). Found some matching terms (${exact}% exact) and topical overlap (${semantic}% semantic), but the majority of sentence structures remain independent.`;
  }
  return `Low Similarity (${overall}% overall similarity). The documents exhibit distinct vocabularies, independent sentence structures, and original semantic compositions.`;
}
