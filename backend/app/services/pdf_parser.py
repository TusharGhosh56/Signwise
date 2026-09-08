import io
import re
from typing import Dict, List, Any
from pypdf import PdfReader


class PDFParseError(Exception):
    pass


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text and metadata from PDF bytes.
    Returns:
        {
            "full_text": str,
            "page_count": int,
            "pages": List[Dict[str, Any]],  # [{"page_number": int, "text": str}]
            "word_count": int,
            "title": str | None
        }
    """
    try:
        stream = io.BytesIO(pdf_bytes)
        reader = PdfReader(stream)

        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise PDFParseError("The uploaded PDF is password-protected. Please upload an unprotected document.")

        pages_data = []
        full_text_chunks = []

        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            # Clean up excessive null bytes or control characters
            cleaned_text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", page_text).strip()
            
            pages_data.append({
                "page_number": idx + 1,
                "text": cleaned_text,
                "char_count": len(cleaned_text),
            })
            if cleaned_text:
                full_text_chunks.append(cleaned_text)

        full_text = "\n\n--- PAGE BREAK ---\n\n".join(full_text_chunks)
        word_count = len(re.findall(r"\w+", full_text))

        if word_count < 15:
            raise PDFParseError(
                "Could not extract sufficient readable text from this PDF. "
                "It may be a scanned image without an OCR text layer."
            )

        # Attempt to read metadata title
        meta_title = None
        if reader.metadata and reader.metadata.title:
            meta_title = str(reader.metadata.title).strip()

        return {
            "full_text": full_text,
            "page_count": len(reader.pages),
            "pages": pages_data,
            "word_count": word_count,
            "title": meta_title,
        }

    except PDFParseError:
        raise
    except Exception as e:
        raise PDFParseError(f"Failed to read PDF file: {str(e)}")
