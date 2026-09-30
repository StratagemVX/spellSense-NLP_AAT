# SpellSense — NLP Spelling Intelligence

> **Understand. Correct. Write Better.**  
> A professional, research-grade, multi-page Natural Language Processing (NLP) web platform comparing **TextBlob** and **SymSpell** algorithms with real-time empirical telemetry, edit distance analysis, and clean modular architecture.

---

## 1. Overview & Multi-Page Architecture

**SpellSense** is structured as a **production-level multi-page web application** with dedicated routes and focused visual hierarchy:

| Page | Route | Purpose & Content |
|---|---|---|
| **Home** | `/` | Product introduction, interactive mini-demo, core features, algorithm summary, primary CTA. |
| **Spelling Corrector** | `/corrector` | Central workspace: multi-line text editor, engine selector (*Compare Both*, *TextBlob*, *SymSpell*), tabbed result cards, mobile-responsive correction cards, and real-time statistics. |
| **How It Works** | `/how-it-works` | Visual 6-stage NLP pipeline (*Tokenization*, *Vocabulary Check*, *Candidate Generation*, *Edit Distance*, *Ranking*, *Reconstruction*) with code snippets and viva notes. |
| **Algorithms** | `/algorithms` | Deep theoretical comparison between Peter Norvig's Bayesian probability model (**TextBlob**) and Wolf Garbe's Symmetric Delete algorithm (**SymSpell**), including a detailed feature matrix. |
| **Examples Gallery** | `/examples` | Categorized benchmark gallery (*Common Typos*, *Student Writing*, *Professional Writing*, *Short Sentences*, *Paragraphs*) with Before/After cards and direct **"Try This Example"** routing. |
| **About & Architecture** | `/about` | Project objective, full-stack architecture diagram, technology stack, and comprehensive college viva defense guide. |

---

## 2. Key Capabilities

- **Dual-Engine Spelling Correction**:
  - Run **TextBlob** alone, **SymSpell** alone, or **Compare Both** side-by-side.
  - Generates recommended consensus output using candidate cross-intersection and bigram rescoring.
- **Mobile-First Responsive Design**:
  - Tested across mobile (320px–414px), tablet (768px–820px), and desktop (1024px–1920px).
  - Responsive cards on mobile replace wide horizontal tables to prevent page overflow.
  - Touch targets $\ge 44$px for seamless mobile interaction.
  - Animated mobile hamburger menu (☰ $\leftrightarrow$ ✕) with auto-close on navigation.
- **No Long Scrolling Fatigue**:
  - Content separated across 6 distinct pages with clean breadcrumbs (`Home / Corrector`, etc.).
  - Tabs in the Corrector page (`[Corrected Text]`, `[Detected Corrections]`, `[Statistics]`, `[SymSpell Inspector]`).
- **Word-by-Word Linguistic Breakdown**:
  - Tabular desktop view and stacked mobile cards showing every token, edit distance, chosen algorithm, and confidence badge (`High`, `Medium`, `Low`).
  - Interactive candidate drawer showing alternate words with frequency counts and probability scores.
- **Empirical Statistics Dashboard**:
  - Real words analyzed, error counts, inter-algorithm consensus percentage, and wall-clock execution time (ms) measured via `time.perf_counter()`.
- **Symmetric Delete & Edit Distance Explorer**:
  - Interactive tool on `/corrector` allowing users to enter any misspelled word (e.g. `speling`) and visualize its generated deletion keys and dictionary intersection in real-time.
- **Viva Defense & Interview Companion**:
  - Built-in academic justification section covering common viva questions, algorithmic tradeoffs, and architectural design choices.

---

## 3. NLP Algorithms

### TextBlob (Norvig Probability Model)
- **Principle**: Formulated on Bayes’ Rule:
  $$\hat{c} = \arg\max_{c \in C} P(w \mid c) \cdot P(c)$$
  Where $P(c)$ represents the unigram probability in the English corpus, and $P(w \mid c)$ denotes the error model probability based on edit distance.
- **Candidate Generation**: At runtime, generates all strings at edit distance 1 and 2 from the input word via deletions, transpositions, substitutions, and insertions.
- **Strengths**: Elegant probabilistic foundation; low initial memory requirement.
- **Trade-off**: Higher CPU complexity ($O(k \cdot n^k)$) during runtime candidate expansion for longer terms.

### SymSpell (Symmetric Delete Algorithm)
- **Principle**: Developed by Wolf Garbe. Eliminates combinatorial expansion by **only generating deletions** on both the vocabulary terms (pre-indexed) and the input query term (at lookup time):
  $$\text{Deletes}(\text{Query}, d) \cap \text{Deletes}(\text{Dictionary}, d) \neq \emptyset$$
- **Lookup Complexity**: Lookups run in average $O(1)$ time, independent of dictionary size.
- **Damerau-Levenshtein Metric**: Accounts for adjacent character transpositions as 1 edit operation.
- **Bigram Rescoring**: Incorporates 242,342 English bigram frequency pairs (e.g. prioritizing *"going to"* with 5.3 billion occurrences over unigram ties like *"join"*).
- **Strengths**: Up to **1,000× faster** than Peter Norvig’s generator; ideal for high-throughput microservices and real-time keystroke assistance.

---

## 4. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│            React 19 + TypeScript + React Router        │
│    (/, /corrector, /how-it-works, /algorithms, ...)    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  FastAPI Backend Server                │
│             (Uvicorn, Pydantic v2, CORS)               │
└───────────────────────────┬────────────────────────────┘
                            │ Token Stream
                            ▼
┌────────────────────────────────────────────────────────┐
│                  NLP Processing Layer                  │
│       ┌───────────────────────┬───────────────────────┐│
│       │    TextBlobEngine     │    SymSpellEngine     ││
│       │ (Norvig Bayes Model)  │  (Symmetric Deletes)  ││
│       └───────────┬───────────┴───────────┬───────────┘│
│                   │                       │            │
│                   └───────────┬───────────┘            │
│                               ▼                        │
│                     Comparison Engine                  │
│        (Consensus, Bigram Scoring, Casing Alignment)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
                  Correction Response
```

---

## 5. Technology Stack

- **Frontend**:
  - React 19
  - TypeScript
  - React Router v7
  - Vite 8
  - Tailwind CSS v4
  - Lucide React (vector iconography)
  - Google Fonts (Inter & JetBrains Mono)
- **Backend**:
  - Python 3.12
  - FastAPI
  - Uvicorn
  - Pydantic v2
- **NLP & Lexicon**:
  - `symspellpy` (Wolf Garbe's Symmetric Delete Engine)
  - `textblob` (Peter Norvig's Spelling Model)
  - English Frequency Lexicon (82,765 unigram terms, 242,342 bigram pairs)

---

## 6. Installation & Execution

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/spellsense.git
cd spellsense
```

### Step 2: Setup & Run Python Backend
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend API will be available at `http://127.0.0.1:8000` with Swagger docs at `/docs`.*

### Step 3: Setup & Run React Frontend
In a separate terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```
*The frontend web app will open at `http://127.0.0.1:5173/`.*

---

## 7. Example Inputs & Demonstrations

| Scenario | Input Sentence | Corrected Output | Focus Note |
|---|---|---|---|
| **Everyday Mistakes** | `I hav a beutiful day and I am goin to the markat.` | `I have a beautiful day and I am going to the market.` | Bigram contextual tie-breaking & Norvig agreement |
| **Academic Draft** | `The experyment showed signifikant diferences between the two grouops in the labratory.` | `The experiment showed significant differences between the two groups in the laboratory.` | Multi-syllable Latinate vocabulary correction |
| **Business Communication** | `Please find attache the updated scheduel for our tomorow meetting with the client.` | `Please find attached the updated schedule for our tomorrow meeting with the client.` | Transposition & missing letter typos |
| **Case Preservation** | `WE RECIEVED THE MESAGE.` | `WE RECEIVED THE MESSAGE.` | Exact uppercase formatting retained |

---

## 8. License & Author

Developed as an advanced NLP full-stack engineering demonstration.
- **Architect & Engineer**: Senior NLP Full-Stack Engineer
- **License**: MIT
