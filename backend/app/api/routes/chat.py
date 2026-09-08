from fastapi import APIRouter, HTTPException
from app.schemas.contract import ChatQueryRequest, ChatQueryResponse
from app.services.gemini_analyzer import gemini_service

router = APIRouter()


@router.post("", response_model=ChatQueryResponse)
async def ask_contract_question(payload: ChatQueryRequest):
    """
    Answers user questions grounded in contract text or analysis context.
    """
    try:
        response = await gemini_service.ask_question(
            question=payload.question,
            contract_text=payload.documentText,
            analysis=payload.analysis,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
