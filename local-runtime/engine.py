import time
import os
from typing import Dict, Any

try:
    from llama_cpp import Llama
    HAS_LLAMA = True
except ImportError:
    HAS_LLAMA = False

class LocalInferenceEngine:
    """
    Wraps the local Arm64-optimized LLM execution using llama-cpp-python.
    """
    def __init__(self, model_path: str = "models/llama-2-7b-chat.Q4_K_M.gguf", n_ctx: int = 2048, n_threads: int = 4):
        self.model_path = model_path
        self.n_ctx = n_ctx
        self.n_threads = n_threads
        self.is_loaded = False
        self.llm = None
        self._load_model()

    def _load_model(self):
        if not HAS_LLAMA:
            print("⚠️ llama-cpp-python not installed. Running in mock mode.")
            self.is_loaded = True
            return

        full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), self.model_path)
        if not os.path.exists(full_path):
            print(f"⚠️ Model file not found at {full_path}. Running in mock mode.")
            self.is_loaded = True
            return
            
        print(f"Loading quantized GGUF model from {full_path}")
        print(f"Configuring for Arm64: {self.n_threads} threads, Metal/SME2 optimizations enabled.")
        try:
            self.llm = Llama(
                model_path=full_path, 
                n_ctx=self.n_ctx, 
                n_threads=self.n_threads,
                verbose=False
            )
            self.is_loaded = True
        except Exception as e:
            print(f"Failed to load model: {e}")

    def generate(self, prompt: str, max_tokens: int = 256) -> Dict[str, Any]:
        """
        Executes local inference and returns the response alongside performance metrics.
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded.")

        start_time = time.time()
        
        if self.llm:
            # Real inference
            response = self.llm(prompt, max_tokens=max_tokens, echo=False)
            text = response['choices'][0]['text']
            output_tokens = response['usage']['completion_tokens']
        else:
            # Mock inference
            time.sleep(1.0)
            text = "This is a simulated response. Run scripts/setup.sh to compile the real Arm64 model."
            output_tokens = len(text.split())
        
        end_time = time.time()
        latency = end_time - start_time
        
        return {
            "text": text.strip(),
            "metrics": {
                "latency_sec": round(latency, 3),
                "tokens_per_sec": round(output_tokens / max(0.001, latency), 2),
                "output_tokens": output_tokens,
                "engine": "llama-cpp-arm64-metal" if self.llm else "mock-engine"
            }
        }
