# SpellSense — NLP Backend Service

High-performance Python backend powered by **FastAPI**, **SymSpell**, and **TextBlob**.

## Features

- **FastAPI Asynchronous Engine**: Ultra-fast REST API with auto-generated interactive OpenAPI documentation (`/docs` and `/redoc`).
- **Singleton SymSpell Engine**: Pre-loads the 82,765 English unigram dictionary and 243,342 bigram frequency tables once upon initialization.
- **Contextual Bigram Rescoring**: Uses adjacent word context to distinguish colloquial typos (e.g. distinguishing *"going to"* from unigram ties like *"join"*).
- **Norvig Bayesian Model via TextBlob**: Implements Peter Norvig's probability model $P(c|w) \propto P(w|c) \cdot P(c)$.
- **Consensus Harmonization Engine**: Analyzes candidate cross-intersections to yield higher precision recommendations than either model alone.
- **Orthographic Casing Preservation**: Retains exact titlecase, uppercase, and punctuation.
- **Deep Word Inspection**: Exposes internal symmetric delete operations and candidate rankings.

## Setup & Execution

### 1. Create Virtual Environment
```bash
python -m venv .venv
```

### 2. Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **macOS/Linux**:
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be operational at `http://127.0.0.1:8000`.
Interactive Swagger UI: `http://127.0.0.1:8000/docs`.

## API Endpoints

- `POST /api/correct`: Analyzes and corrects input text with statistical telemetry.
- `POST /api/correct/textblob`: Corrects using TextBlob only.
- `POST /api/correct/symspell`: Corrects using SymSpell only.
- `POST /api/analyze-word`: Inspects symmetric delete keys and candidate rankings for a single word.
- `GET /api/examples`: Returns pre-configured academic, everyday, and typo test sentences.
- `GET /api/health`: Service health check and dictionary metadata.
