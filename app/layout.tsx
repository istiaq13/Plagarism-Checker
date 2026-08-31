import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plagiarism Detection System | TF-IDF & Sentence-BERT',
  description: 'Text similarity and plagiarism detection combining TF-IDF and Sentence-BERT semantic analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
