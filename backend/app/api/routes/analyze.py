from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from app.schemas.contract import ContractAnalysis, AnalyzeTextRequest
from app.services.pdf_parser import extract_text_from_pdf_bytes, PDFParseError
from app.services.docx_parser import extract_text_from_docx_bytes, DOCXParseError
from app.services.gemini_analyzer import gemini_service

router = APIRouter()


@router.post("/upload", response_model=ContractAnalysis)
async def analyze_document_upload(
    file: UploadFile = File(...),
):
    """
    Accepts a PDF, DOCX, or TXT document upload, extracts text and clauses,
    runs Gemini 2.0 contract intelligence, and returns a ContractAnalysis.
    """
    filename_lower = (file.filename or "").lower()
    if not filename_lower.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF (.pdf), Word Document (.docx), or Plain Text (.txt) file."
        )

    try:
        content_bytes = await file.read()

        if len(content_bytes) > 25 * 1024 * 1024:  # 25 MB max
            raise HTTPException(status_code=400, detail="File size exceeds maximum 25 MB limit.")

        if filename_lower.endswith(".txt"):
            text = content_bytes.decode("utf-8", errors="replace")
        elif filename_lower.endswith(".docx"):
            parsed_docx = extract_text_from_docx_bytes(content_bytes)
            text = parsed_docx["full_text"]
        else:
            # PDF extraction
            parsed_pdf = extract_text_from_pdf_bytes(content_bytes)
            text = parsed_pdf["full_text"]

        analysis = await gemini_service.analyze_contract(
            contract_text=text,
            file_name=file.filename or "Contract_Document",
        )

        return analysis

    except (PDFParseError, DOCXParseError) as e:
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
