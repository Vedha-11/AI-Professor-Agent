"""
Embedding service using ChromaDB and sentence-transformers.
"""
import os
import chromadb
from chromadb.utils import embedding_functions

# ChromaDB persistent storage
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "chroma")

# Initialize ChromaDB client
client = chromadb.PersistentClient(path=CHROMA_DIR)

# Use sentence-transformers for embeddings (runs locally)
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)


def get_or_create_collection(course_id: int):
    """Get or create a ChromaDB collection for a course."""
    collection_name = f"course_{course_id}"
    return client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"course_id": str(course_id)}
    )


def add_chunks_to_collection(
    course_id: int,
    material_id: int,
    chunks: list[dict],
    filename: str
):
    """
    Add document chunks to the vector store.
    
    Args:
        course_id: The course ID
        material_id: The material/document ID
        chunks: List of chunk dicts with 'text' and 'index'
        filename: Original filename for metadata
    """
    collection = get_or_create_collection(course_id)
    
    # Prepare data for ChromaDB
    ids = [f"mat{material_id}_chunk{c['index']}" for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {
            "material_id": str(material_id),
            "chunk_index": str(c["index"]),
            "filename": filename
        }
        for c in chunks
    ]
    
    # Add to collection (ChromaDB handles embedding automatically)
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    
    return len(chunks)


def search_course_materials(
    course_id: int,
    query: str,
    n_results: int = 3
) -> list[dict]:
    """
    Search course materials for relevant chunks.
    
    Args:
        course_id: The course to search in
        query: The search query
        n_results: Number of results to return
    
    Returns:
        List of relevant chunks with metadata
    """
    collection = get_or_create_collection(course_id)
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    # Format results
    chunks = []
    if results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            chunks.append({
                "text": doc,
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                "distance": results["distances"][0][i] if results["distances"] else None
            })
    
    return chunks


def delete_material_chunks(course_id: int, material_id: int):
    """Delete all chunks for a material from the vector store."""
    collection = get_or_create_collection(course_id)
    
    # Get all chunk IDs for this material
    results = collection.get(
        where={"material_id": str(material_id)}
    )
    
    if results["ids"]:
        collection.delete(ids=results["ids"])
        return len(results["ids"])
    return 0
