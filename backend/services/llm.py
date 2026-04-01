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
    model: str = DEFAULT_MODEL,
    student_profile: dict = None,
    include_citations: bool = True
) -> str:
    """
    Generate a professor-like response using RAG context.
    
    Args:
        question: The student's question
        context_chunks: Retrieved relevant chunks from vector store
        course_name: Name of the course for persona
        model: The LLM model to use
        student_profile: Optional student profile for personalization
        include_citations: Whether to include source citations
    
    Returns:
        Professor's response with optional citations
    """
    # Build context from chunks with numbered sources for citations
    context_parts = []
    sources_map = {}
    for i, c in enumerate(context_chunks, 1):
        filename = c['metadata'].get('filename', 'course material')
        page = c['metadata'].get('page', '')
        source_label = f"[Source {i}]"
        sources_map[source_label] = f"{filename}" + (f" (page {page})" if page else "")
        context_parts.append(f"{source_label} From: {filename}\n{c['text']}")
    
    context_text = "\n\n".join(context_parts)
    
    # Build personalization section
    personalization = ""
    if student_profile:
        weak = ", ".join(student_profile.get("weak_topics", [])) or "None identified yet"
        strong = ", ".join(student_profile.get("strong_topics", [])) or "None identified yet"
        perf = student_profile.get("performance_score", 0)
        
        personalization = f"""
STUDENT PROFILE:
- Weak topics: {weak}
- Strong topics: {strong}
- Performance score: {perf:.1f}%

Adapt your explanation based on this profile:
- If the question relates to weak topics, provide extra detail and examples
- If performance is below 70%, use simpler language and more step-by-step explanations
- Encourage improvement in weak areas while building on strengths
"""
    
    # Citation instructions
    citation_instruction = ""
    if include_citations:
        citation_instruction = """
IMPORTANT: When referencing information from the materials, cite your sources using [Source N] notation.
For example: "According to [Source 1], machine learning is..."
"""
    
    # Professor persona system prompt
    system_prompt = f"""You are a knowledgeable and helpful professor teaching "{course_name}".

Your role is to:
- Answer student questions clearly and accurately
- Use the provided course materials as your primary source
- Explain concepts in an educational, approachable manner
- If the answer isn't in the materials, say so honestly
- Encourage further learning and curiosity
{citation_instruction}{personalization}
Always maintain a warm, professional, and supportive tone like a real professor would."""

    # User prompt with context
    user_prompt = f"""A student has asked the following question about {course_name}:

QUESTION: {question}

Here is relevant information from the course materials:

{context_text}

Please provide a helpful, educational response based on the course materials above. If the materials don't contain enough information to fully answer the question, acknowledge this and provide what guidance you can."""

    response = generate_response(
        prompt=user_prompt,
        model=model,
        system_prompt=system_prompt
    )
    
    # Append source legend if citations are included
    if include_citations and sources_map:
        source_legend = "\n\n---\n📚 **Sources:**\n"
        for label, source in sources_map.items():
            source_legend += f"- {label}: {source}\n"
        response += source_legend
    
    return response


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
