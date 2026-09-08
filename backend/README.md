# Signwise AI Backend

FastAPI backend service for **Signwise** — Plain-English contract analysis, risk detection, obligation mapping, and negotiation intelligence powered by **Google Gemini 2.0 Flash**.

---

## Quick Start

### 1. Create and Activate Virtual Environment

```bash
# In d:\fun\Signwise\backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
.\venv\Scripts\activate.bat

# macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```
*(Note: If no API key is provided, the backend automatically runs in deterministic demo mode with realistic sample contract analyses).*

### 4. Run the Server

```bash
python run.py
```
Or directly with Uvicorn:
```bash
uvicorn app.main:app --reload --port 8000
```

- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Alternative ReDoc**: `http://127.0.0.1:8000/redoc`

---

## API Endpoints

| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck & service status | None |
| `POST` | `/api/analyze/upload` | Upload and analyze a PDF or TXT contract | Multipart Form `file: UploadFile` |
| `POST` | `/api/analyze/text` | Analyze raw pasted contract text | JSON: `{"text": "...", "fileName": "..."}` |
| `POST` | `/api/chat` | Ask grounded Q&A questions about contract | JSON: `{"question": "...", "documentText": "..."}` |

---

## Schema Compatibility

All response JSON objects strictly adhere to the frontend TypeScript interfaces defined in `frontend/src/types/contract.ts`:
- `ContractAnalysis`
- `ClauseBreakdown`
- `ObligationItem`
- `FinancialItem`
- `SuggestedQuestionItem`
