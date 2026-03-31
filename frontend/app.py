"""
AI Professor Agent - Streamlit Frontend
"""
import streamlit as st
import requests

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


# Header
st.title("🎓 AI Professor Agent")
st.markdown("*Your course-specific AI tutor*")

# Sidebar - System Status
with st.sidebar:
    st.header("System Status")
    
    # Backend status
    if check_backend():
        st.success("✅ Backend: Connected")
    else:
        st.error("❌ Backend: Offline")
    
    st.divider()
    st.caption("AI Professor v0.1.0")

# Main content placeholder
st.info("👋 Welcome! Select a course to begin learning.")

# Placeholder sections
col1, col2 = st.columns(2)

with col1:
    st.subheader("📚 Courses")
    st.write("No courses available yet.")

with col2:
    st.subheader("💬 Ask a Question")
    question = st.text_input("Your question:")
    if st.button("Ask Professor"):
        if question:
            st.write("*Feature coming in Phase 7...*")
        else:
            st.warning("Please enter a question.")
