# NLP-Based Plagiarism Detection System — Architecture Document

## 1. Project Overview

This project is a web-based plagiarism detection system that combines a classical NLP
technique (TF-IDF) with a modern transformer-based technique (Sentence-BERT embeddings)
to detect both **exact/textual similarity** and **semantic/paraphrased similarity**
between documents.

The entire application — frontend, backend, and NLP pipeline — is built on **Next.js**,
avoiding the need for a separate Python service.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) |
| Backend | Next.js API Routes / Route Handlers |
| Language | TypeScript |
| NLP Engine | Transformers.js (`@xenova/transformers`) |
| Embedding Model | `all-MiniLM-L6-v2` (Sentence-BERT) |
| Classical NLP | TF-IDF (via `natural` or custom implementation) |
| Similarity Metric | Cosine Similarity |
| PDF Parsing | `pdf-parse` |
| DOCX Parsing | `mammoth` |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Charts / Visualization | Recharts |
| Deployment | Vercel |

---

## 3. High-Level Architecture

```
                    Next.js
              ┌─────────────────┐
              │   Frontend       │
              │  - Upload files  │
              │  - Enter text    │
              │  - View results  │
              │  - Highlighting  │
              └────────┬─────────┘
                       │
                       ▼
              Next.js API Routes
                       │
                       ▼
              ┌─────────────────┐
              │  NLP Processing  │
              │  - TF-IDF        │
              │  - Embeddings    │
              │  - Similarity    │
              └────────┬─────────┘
                       │
                       ▼
                  PostgreSQL DB
```

Everything runs inside a single Next.js codebase:

```
Next.js
 ├── UI              (React + Tailwind)
 ├── API             (Route Handlers)
 ├── NLP             (Transformers.js + TF-IDF)
 ├── File Processing (pdf-parse, mammoth)
 └── Database         (PostgreSQL via Prisma)
```

This is the simplest possible deployment model: one framework, one language
(TypeScript), one deployment target (Vercel).

---

## 4. Why Next.js for Both Frontend and Backend

Two architecture options were considered:

### Option A — 100% Next.js (chosen)
- Next.js frontend + API routes handle everything, including NLP via Transformers.js.
- Simplest deployment — a single codebase, single language, single hosting target.

### Option B — Next.js + Python FastAPI microservice
- Next.js frontend talks to a separate Python backend running Sentence-BERT via
  PyTorch/Hugging Face/scikit-learn.
- Better suited for heavier academic experimentation with different models, but
  adds deployment complexity (two services, two languages).

**Decision:** Option A (100% Next.js) is used for this project, since it keeps the
whole application in one codebase while still supporting genuine NLP techniques
through Transformers.js.

---

## 5. NLP Mechanisms Used

Three NLP mechanisms are combined rather than relying on a single technique:

### 5.1 TF-IDF — Exact / Textual Similarity
Measures term importance across documents using Term Frequency–Inverse Document
Frequency, compared via Cosine Similarity.

```
Document A ──┐
             ├── TF-IDF ── Cosine Similarity ── Score
Document B ──┘
```

- Good at catching near-identical or copy-pasted text.
- Weak at detecting paraphrased content.

### 5.2 Sentence Embeddings — Semantic Similarity (core mechanism)
Uses a pretrained Sentence-BERT model (`all-MiniLM-L6-v2`) to convert each sentence
into a vector representing its meaning, then compares vectors with cosine similarity.

```
Embedding A ──┐
              ├── Cosine Similarity → e.g. 91%
Embedding B ──┘
```

Example:
- A: "Students can submit assignments online."
- B: "Learners are able to upload their coursework digitally."

Different wording, similar meaning — SBERT embeddings for A and B end up close
together in vector space, catching paraphrasing that TF-IDF would miss.

### 5.3 Sentence-Level Matching
Rather than comparing two whole documents as single blocks, each document is split
into sentences, and every sentence in Document A is compared against every
sentence in Document B.

```
Document A                Document B
 ├── Sentence 1             ├── Sentence 1
 ├── Sentence 2             ├── Sentence 2
 ├── Sentence 3             ├── Sentence 3
 └── Sentence 4             └── Sentence 4
```

Example similarity matrix:

```
A1 ↔ B1 = 92%
A1 ↔ B2 = 21%
A1 ↔ B3 = 15%

A2 ↔ B1 = 18%
A2 ↔ B2 = 87%
A2 ↔ B3 = 31%
```

This lets the system pinpoint exactly which sentences/passages are highly similar,
so they can be highlighted in the UI.

---

## 6. Full Processing Pipeline

```
              PDF / DOCX
                  ↓
             Text Extraction        (pdf-parse / mammoth)
                  ↓
            Sentence Splitting
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
      TF-IDF              SBERT
        ↓                   ↓
 Textual Similarity   Semantic Similarity
        └─────────┬─────────┘
                  ↓
          Sentence-Level Matching
                  ↓
          Similarity Calculation
                  ↓
        ┌───────────────────┐
        │  Plagiarism Report │
        │  Overall:  82%      │
        │  Exact:    61%      │
        │  Semantic: 89%      │
        │  Risk:     HIGH     │
        └───────────────────┘
```

---

## 7. Component Breakdown

### 7.1 Frontend (Next.js + React + Tailwind)
- File upload UI (PDF / DOCX) and raw text input.
- Results dashboard showing overall score, exact-match score, semantic score,
  and risk level.
- Sentence-level highlighting to visually flag matched passages.
- Charts (Recharts) for visualizing similarity distribution across sentences.

### 7.2 Backend (Next.js API Routes)
- `/api/upload` — accepts PDF/DOCX/text input, triggers extraction.
- `/api/extract` — extracts raw text using `pdf-parse` (PDF) or `mammoth` (DOCX).
- `/api/analyze` — runs the NLP pipeline (TF-IDF + SBERT + sentence matching) and
  returns a structured similarity report.
- `/api/reports` — persists and retrieves past comparison reports from PostgreSQL.

### 7.3 NLP Layer
- **Transformers.js** loads the `all-MiniLM-L6-v2` model client-side or
  server-side (within the Node.js runtime) to generate sentence embeddings
  without needing Python.
- **TF-IDF module** (via `natural` or a custom implementation) computes classical
  term-based similarity.
- **Cosine similarity utility** is shared by both TF-IDF vectors and SBERT
  embeddings.

### 7.4 Database (PostgreSQL + Prisma)
- Stores uploaded document metadata, extracted text, computed similarity scores,
  and historical reports.
- Prisma provides type-safe schema and query access from within the Next.js
  API routes.

### 7.5 Deployment (Vercel)
- Single deployment target for the entire Next.js app (frontend, API routes,
  and NLP logic all ship together).

---

## 8. Recommended Stack Summary

| Part | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Next.js Route Handlers |
| Language | TypeScript |
| NLP | Transformers.js |
| Model | all-MiniLM-L6-v2 |
| Similarity | Cosine Similarity |
| Basic plagiarism check | TF-IDF |
| PDF handling | pdf-parse |
| DOCX handling | mammoth |
| Database | PostgreSQL |
| ORM | Prisma |
| UI | Tailwind CSS |
| Charts | Recharts |
| Deployment | Vercel |

---

## 9. Why This Combination Is Academically Strong

Combining **TF-IDF + Cosine Similarity** (traditional NLP) with
**Sentence-BERT + sentence-level semantic matching** (modern transformer-based NLP)
gives the project both:

1. A classical, easily explainable NLP baseline (TF-IDF).
2. A modern, semantically aware technique (SBERT embeddings) capable of catching
   paraphrased plagiarism that keyword-based methods miss.

This dual approach — plus keeping the entire system inside one Next.js codebase via
Transformers.js — makes the project both technically sound and simple to build,
run, and deploy.
