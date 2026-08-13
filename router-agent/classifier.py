import math
import re
from typing import Dict, Any

class ComplexityClassifier:
    """
    Evaluates the complexity of incoming LLM prompts to determine if they 
    should be handled by a local Arm64 quantized model or routed to the cloud.
    """
    def __init__(self, avg_chars_per_token: float = 4.0):
        self.avg_chars_per_token = avg_chars_per_token
        
        # Heuristics for semantic difficulty
        self.high_complexity_keywords = [
            "synthesize", "analyze", "explain the difference",
            "write a comprehensive", "derive", "mathematical proof",
            "system architecture", "compare and contrast", "evaluate"
        ]
        
        # Simple coding detection
        self.code_patterns = [
            r"def\s+\w+\(", r"class\s+\w+:", r"import\s+\w+",
            r"function\s+\w+\(", r"const\s+\w+\s*=", r"struct\s+\w+"
        ]

    def estimate_tokens(self, text: str) -> int:
        return max(1, int(len(text) / self.avg_chars_per_token))
        
    def _calculate_semantic_score(self, text: str) -> float:
        score = 0.0
        lower_text = text.lower()
        
        for keyword in self.high_complexity_keywords:
            if keyword in lower_text:
                score += 5.0
                
        for pattern in self.code_patterns:
            if re.search(pattern, text):
                score += 3.0
                
        # Length acts as a multiplier, but should never penalize a semantically complex short prompt
        tokens = self.estimate_tokens(text)
        length_multiplier = max(1.0, math.log10(tokens + 10) / 2.0)
        
        return min(10.0, score * length_multiplier)

    def score_request(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """
        Returns a complexity score from 0.0 (trivial) to 10.0 (highly complex),
        along with the signals used to compute it.
        """
        full_text = f"{system_prompt}\n{prompt}"
        
        tokens = self.estimate_tokens(full_text)
        semantic_score = self._calculate_semantic_score(full_text)
        
        # Base token complexity (arbitrary threshold for "long")
        token_score = min(10.0, (tokens / 100.0))
        
        # Final combined score, weighted
        final_score = (token_score * 0.4) + (semantic_score * 0.6)
        
        return {
            "complexity_score": round(min(10.0, final_score), 2),
            "estimated_tokens": tokens,
            "semantic_difficulty": round(semantic_score, 2),
            "signals": {
                "has_code": any(re.search(p, full_text) for p in self.code_patterns),
                "is_long_context": tokens > 1000
            }
        }
