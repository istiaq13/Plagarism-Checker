import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/extractor/file-extractor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || 'document.txt';
    const mimeType = file.type;

    const extractedText = await extractTextFromFile(buffer, fileName, mimeType);

    return NextResponse.json({
      fileName,
      sizeBytes: buffer.length,
      text: extractedText,
      wordCount: extractedText.trim().split(/\s+/).filter(Boolean).length
    });
  } catch (error: any) {
    console.error('Error in /api/extract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}
