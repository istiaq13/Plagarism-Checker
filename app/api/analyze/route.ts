import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocuments } from '@/lib/nlp/detector';
import { AnalysisRequest } from '@/lib/types/plagiarism';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();

    if (!body || !body.docA || !body.docB) {
      return NextResponse.json(
        { error: 'Missing document input. Both docA and docB are required.' },
        { status: 400 }
      );
    }

    if (!body.docA.text?.trim() || !body.docB.text?.trim()) {
      return NextResponse.json(
        { error: 'Both documents must have non-empty text content.' },
        { status: 400 }
      );
    }

    // Pure in-memory runtime analysis — no database involved
    const report = await analyzeDocuments(body);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during plagiarism analysis' },
      { status: 500 }
    );
  }
}
