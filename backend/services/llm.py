"""
LLM service using Ollama for local inference.
"""
import ollama

# Default model - phi3 is fast and lightweight
DEFAULT_MODEL = "phi3"


def generate_response(
    prompt: str,
    model: str = DEFAULT_MODEL,
    system_prompt: str = None
) -> str:
    """
    Generate a response using Ollama.
    
    Args:
        prompt: The user prompt
        model: The model to use (phi3, mistral, llama3, etc.)
        system_prompt: Optional system prompt for context
    
    Returns:
        The generated response text
    """
    messages = []
    
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    
    messages.append({"role": "user", "content": prompt})
    
    response = ollama.chat(
        model=model,
        messages=messages
    )
    
    return response["message"]["content"]


def generate_with_context(
    question: str,
    context_chunks: list[dict],
    course_name: str,
    model: str = DEFAULT_MODEL
) -> str:
    """
    Generate a professor-like response using RAG context.
    
    Args:
        question: The student's question
        context_chunks: Retrieved relevant chunks from vector store
        course_name: Name of the course for persona
        model: The LLM model to use
    
    Returns:
        Professor's response
    """
    # Build context from chunks
    context_text = "\n\n".join([
        f"[From: {c['metadata'].get('filename', 'course material')}]\n{c['text']}"
        for c in context_chunks
    ])
    
    # Professor persona system prompt
    system_prompt = f"""You are a knowledgeable and helpful professor teaching "{course_name}".

Your role is to:
- Answer student questions clearly and accurately
- Use the provided course materials as your primary source
- Explain concepts in an educational, approachable manner
- If the answer isn't in the materials, say so honestly
- Encourage further learning and curiosity

Always maintain a warm, professional, and supportive tone like a real professor would."""

    # User prompt with context
    user_prompt = f"""A student has asked the following question about {course_name}:

QUESTION: {question}

Here is relevant information from the course materials:

{context_text}

Please provide a helpful, educational response based on the course materials above. If the materials don't contain enough information to fully answer the question, acknowledge this and provide what guidance you can."""

    return generate_response(
        prompt=user_prompt,
        model=model,
        system_prompt=system_prompt
    )


def check_ollama_available(model: str = DEFAULT_MODEL) -> dict:
    """Check if Ollama is available and the model is loaded."""
    try:
        # Try to list models
        models = ollama.list()
        model_list = models.get("models", [])
        model_names = []
        for m in model_list:
            if isinstance(m, dict):
                name = m.get("name", m.get("model", ""))
            else:
                name = str(m)
            if name:
                model_names.append(name.split(":")[0])
        
        return {
            "available": True,
            "models": model_names,
            "default_model": model,
            "model_loaded": model in model_names
        }
    except Exception as e:
        return {
            "available": False,
            "error": str(e)
        }
