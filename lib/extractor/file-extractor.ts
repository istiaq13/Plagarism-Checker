import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded file Buffer based on MIME type and filename.
 */
export async function extractTextFromFile(buffer: Buffer, fileName: string, mimeType?: string): Promise<string> {
  const lowerName = fileName.toLowerCase();

  try {
    // 1. DOCX Handling
    if (lowerName.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return cleanExtractedText(result.value);
    }

    // 2. PDF Handling
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      // Dynamic require of pdf-parse to prevent issues during build
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return cleanExtractedText(data.text);
    }

    // 3. Plain Text / TXT / Markdown
    const text = buffer.toString('utf-8');
    return cleanExtractedText(text);
  } catch (error: any) {
    console.error(`Error parsing file ${fileName}:`, error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message || error}`);
  }
}

/**
 * Cleans extracted text: fixes hyphenated line breaks, abnormal control chars, and excessive spacing.
 */
export function cleanExtractedText(raw: string): string {
  if (!raw) return '';

  return raw
    // Rejoin words broken across line breaks with hyphens
    .replace(/(\w+)-\n(\w+)/g, '$1$2')
    // Replace non-breaking spaces and other whitespace variations
    .replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
    // Replace carriage returns
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
