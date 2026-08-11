#!/bin/bash
set -e

echo "🚀 Setting up Arm-Native Inference Router"

# 1. Create a virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# 2. Install dependencies
echo "📦 Installing standard dependencies..."
pip install -r requirements.txt

# 3. Compile llama-cpp-python with Apple Silicon / Arm64 Metal optimizations
echo "🔥 Compiling llama-cpp-python with Apple Silicon / Arm64 Metal optimizations..."
CMAKE_ARGS="-DLLAMA_METAL=on" pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir

# 4. Download a quantized model
mkdir -p models
MODEL_URL="https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf"
MODEL_FILE="models/llama-2-7b-chat.Q4_K_M.gguf"

if [ ! -f "$MODEL_FILE" ]; then
    echo "⬇️ Downloading quantized model (Llama-2-7B-Chat Q4_K_M)..."
    curl -L -o "$MODEL_FILE" "$MODEL_URL"
else
    echo "✅ Model already downloaded."
fi

echo "🎉 Setup complete! You can now run the UI: streamlit run demo/app.py"
