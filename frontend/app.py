"""
AI Professor Agent - Streamlit Frontend
"""
import streamlit as st
import requests
import os

st.set_page_config(
    page_title="AI Professor",
    page_icon="🎓",
    layout="wide"
)

BACKEND_URL = "http://127.0.0.1:8000"


def check_backend():
    """Check if backend is running."""
    try:
        resp = requests.get(f"{BACKEND_URL}/health", timeout=2)
        return resp.status_code == 200
    except requests.RequestException:
        return False


def get_courses():
    """Fetch all courses."""
    try:
        resp = requests.get(f"{BACKEND_URL}/courses/", timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass
    return []


def ask_question(course_id: int, question: str):
    """Ask a question to the AI Professor."""
    try:
        resp = requests.post(
            f"{BACKEND_URL}/qa/ask-simple",
            json={"course_id": course_id, "question": question},
            timeout=120
        )
        if resp.status_code == 200:
            return resp.json()
        else:
            return {"error": resp.json().get("detail", "Unknown error")}
    except requests.RequestException as e:
        return {"error": str(e)}


# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "selected_course" not in st.session_state:
    st.session_state.selected_course = None


# Header
st.title("🎓 AI Professor Agent")
st.markdown("*Your course-specific AI tutor powered by local LLM*")

# Sidebar
with st.sidebar:
    st.header("📊 System Status")
    
    # Backend status
    backend_ok = check_backend()
    if backend_ok:
        st.success("✅ Backend: Connected")
    else:
        st.error("❌ Backend: Offline")
        st.info("Start backend with:\n`uvicorn backend.main:app`")
    
    # Check Ollama
    if backend_ok:
        try:
            ollama_status = requests.get(f"{BACKEND_URL}/qa/status", timeout=5).json()
            if ollama_status.get("available"):
                st.success("✅ Ollama: Running")
            else:
                st.error("❌ Ollama: Not running")
        except:
            st.warning("⚠️ Ollama: Unknown")
    
    st.divider()
    
    # Course selection
    st.header("📚 Select Course")
    courses = get_courses() if backend_ok else []
    
    if courses:
        course_names = {c["id"]: c["name"] for c in courses}
        selected_id = st.selectbox(
            "Choose a course:",
            options=list(course_names.keys()),
            format_func=lambda x: course_names[x],
            key="course_select"
        )
        st.session_state.selected_course = selected_id
        
        # Show course info
        selected_course = next((c for c in courses if c["id"] == selected_id), None)
        if selected_course and selected_course.get("description"):
            st.caption(selected_course["description"])
    else:
        st.info("No courses available yet.")
        st.session_state.selected_course = None
    
    st.divider()
    
    # Clear chat button
    if st.button("🗑️ Clear Chat"):
        st.session_state.messages = []
        st.rerun()
    
    st.divider()
    st.caption("AI Professor v0.1.0")
    st.caption("Powered by Ollama + ChromaDB")


# Main content
if not backend_ok:
    st.warning("⚠️ Backend is not running. Please start the FastAPI server.")
    st.code("cd LLM_Project\npython -m uvicorn backend.main:app --reload", language="bash")

elif st.session_state.selected_course is None:
    st.info("👋 Welcome! Please select a course from the sidebar to start learning.")
    
    st.markdown("### Getting Started")
    st.markdown("""
    1. **Create a course** via the API or admin interface
    2. **Upload materials** (PDFs, notes, syllabi)
    3. **Ingest materials** to create embeddings
    4. **Ask questions** and learn from your AI Professor!
    """)

else:
    # Chat interface
    course_name = next(
        (c["name"] for c in courses if c["id"] == st.session_state.selected_course),
        "Course"
    )
    
    st.subheader(f"💬 Chat with Professor - {course_name}")
    
    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if message.get("sources"):
                st.caption(f"📄 Sources: {', '.join(message['sources'])}")
    
    # Chat input
    if prompt := st.chat_input("Ask your professor a question..."):
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get professor response
        with st.chat_message("assistant"):
            with st.spinner("Professor is thinking..."):
                response = ask_question(st.session_state.selected_course, prompt)
            
            if "error" in response:
                st.error(f"Error: {response['error']}")
                assistant_message = {"role": "assistant", "content": f"Sorry, I encountered an error: {response['error']}"}
            else:
                st.markdown(response["answer"])
                if response.get("sources"):
                    st.caption(f"📄 Sources: {', '.join(response['sources'])}")
                assistant_message = {
                    "role": "assistant",
                    "content": response["answer"],
                    "sources": response.get("sources", [])
                }
            
            st.session_state.messages.append(assistant_message)

