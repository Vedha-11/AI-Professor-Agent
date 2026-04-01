#!/bin/bash
# AI Professor Agent - Linux/Mac Launcher

set -e

echo "============================================"
echo "   AI Professor Agent - One-Click Launcher"
echo "============================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed."
    echo "Install it:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip"
    echo "  Mac: brew install python3"
    exit 1
fi
echo "[OK] Python3 found: $(python3 --version)"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "[ERROR] Ollama is not installed."
    echo "Install it: curl -fsSL https://ollama.com/install.sh | sh"
    exit 1
fi
echo "[OK] Ollama found."

# Check if phi3 model is available
echo ""
echo "Checking for phi3 model..."
if ! ollama list 2>/dev/null | grep -qi "phi3"; then
    echo "[INFO] phi3 model not found. Downloading now..."
    echo "This may take 5-10 minutes depending on your internet speed."
    ollama pull phi3
fi
echo "[OK] phi3 model ready."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "[OK] Virtual environment created."
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt -q
echo "[OK] All dependencies installed."

# Create data directories
mkdir -p data/uploads data/chroma

echo ""
echo "============================================"
echo "   Starting AI Professor Agent..."
echo "============================================"
echo ""
echo "Backend  : http://localhost:8000"
echo "API Docs : http://localhost:8000/docs"
echo "Frontend : http://localhost:8501"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "============================================"
echo ""

# Start backend in background
python -m uvicorn backend.main:app --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 4

# Trap Ctrl+C to kill both processes
trap "echo 'Shutting down...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT TERM

# Start frontend (keeps terminal open)
streamlit run frontend/app.py --server.port 8501

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
