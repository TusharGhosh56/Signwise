from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from app.schemas.contract import ContractAnalysis, AnalyzeTextRequest
from app.services.pdf_parser import extract_text_from_pdf_bytes, PDFParseError
from app.services.gemini_analyzer import gemini_service

router = APIRouter()


@router.post("/upload", response_model=ContractAnalysis)
async def analyze_document_upload(
    file: UploadFile = File(...),
):
    """
    Accepts a PDF document upload, extracts text and clauses,
    runs Gemini 2.0 contract intelligence, and returns a ContractAnalysis.
    """
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF (.pdf) or Plain Text (.txt) file."
        )

    try:
        content_bytes = await file.read()

        if len(content_bytes) > 25 * 1024 * 1024:  # 25 MB max
            raise HTTPException(status_code=400, detail="File size exceeds maximum 25 MB limit.")

        if file.filename.lower().endswith(".txt"):
            text = content_bytes.decode("utf-8", errors="replace")
        else:
            # PDF extraction
            parsed_pdf = extract_text_from_pdf_bytes(content_bytes)
            text = parsed_pdf["full_text"]

        analysis = await gemini_service.analyze_contract(
            contract_text=text,
            file_name=file.filename,
        )

        return analysis

    except PDFParseError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/text", response_model=ContractAnalysis)
async def analyze_text(
    payload: AnalyzeTextRequest,
):
    """
    Analyzes raw contract text directly (e.g. pasted agreement clauses).
    """
    try:
        analysis = await gemini_service.analyze_contract(
            contract_text=payload.text,
            file_name=payload.fileName or "Pasted_Agreement.txt",
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")
