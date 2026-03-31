"""
Document processing: extract text from PDFs and text files.
"""
import os
from pypdf import PdfReader


def extract_text_from_file(filepath: str) -> str:
    """Extract text content from a file (PDF, TXT, MD)."""
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(filepath)
    elif ext in (".txt", ".md"):
        return extract_text_from_text(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def extract_text_from_pdf(filepath: str) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(filepath)
    text_parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            text_parts.append(text)
    return "\n\n".join(text_parts)


def extract_text_from_text(filepath: str) -> str:
    """Read text from a text file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """
    Split text into overlapping chunks for embedding.
    
    Args:
        text: The full document text
        chunk_size: Target size of each chunk in characters
        overlap: Number of characters to overlap between chunks
    
    Returns:
        List of dicts with 'text' and 'index' keys
    """
    chunks = []
    start = 0
    index = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at a sentence or paragraph boundary
        if end < len(text):
            # Look for paragraph break
            para_break = text.rfind("\n\n", start, end)
            if para_break > start + chunk_size // 2:
                end = para_break
            else:
                # Look for sentence break
                for punct in [". ", "! ", "? ", "\n"]:
                    sent_break = text.rfind(punct, start, end)
                    if sent_break > start + chunk_size // 2:
                        end = sent_break + len(punct)
                        break
        
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append({
                "text": chunk_text,
                "index": index
            })
            index += 1
        
        start = end - overlap
    
    return chunks
