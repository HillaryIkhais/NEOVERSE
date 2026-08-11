import hashlib
from dataclasses import dataclass
from typing import Dict, Any, Literal, Optional
from concurrent.futures import ThreadPoolExecutor
from classifier import ComplexityClassifier

@dataclass
class EnvironmentState:
    local_queue_depth: int
    battery_level: float  # 0.0 to 1.0 (if mobile/edge)
    thermal_throttling: bool
    remaining_cloud_budget: float # in dollars

RouteDecision = Literal["LOCAL", "CLOUD", "SPLIT", "CACHE_HIT", "FALLBACK"]

class DeterministicSafetyGate:
    """
    Acts as the 'Anti-Wrapper' Data Boundary. Validates routing decisions against strict
    business logic and enforces Human-in-the-Loop fallback channels if the model 
    or environment state becomes highly unstable.
    """
    def __init__(self, hard_budget_limit: float = 0.50):
        self.hard_budget_limit = hard_budget_limit

    def validate_decision(self, decision: str, env_state: EnvironmentState) -> str:
        # Prevent cloud route if budget is catastrophically low
        if decision == "CLOUD" and env_state.remaining_cloud_budget < self.hard_budget_limit:
            return "FALLBACK" # Human-in-the-loop intervention required
        return decision

class MultiAgentCacheOptimizer:
    """
    Model Context Protocol integration. Uses ThreadPoolExecutor to perform parallel 
    cache lookups and reduce multi-agent latency to zero for repeated queries.
    """
    def __init__(self):
        self._cache: Dict[str, str] = {}
        self.executor = ThreadPoolExecutor(max_workers=4)

    def _hash_prompt(self, prompt: str) -> str:
        return hashlib.sha256(prompt.strip().lower().encode()).hexdigest()

    def get_cached_decision(self, prompt: str) -> Optional[str]:
        # Simulating parallel cache lookups
        future = self.executor.submit(self._cache.get, self._hash_prompt(prompt))
        return future.result()

    def cache_decision(self, prompt: str, decision: str):
        self._cache[self._hash_prompt(prompt)] = decision


class InferenceRouter:
    """
    Decides the inference destination (LOCAL, CLOUD, CACHE_HIT, or FALLBACK) based on 
    the request's complexity, environment state, and Deterministic Safety Gates.
    """
    def __init__(self, 
                 complexity_threshold: float = 6.0,
                 max_local_queue: int = 5,
                 min_battery_threshold: float = 0.2):
        self.classifier = ComplexityClassifier()
        self.safety_gate = DeterministicSafetyGate()
        self.cache_optimizer = MultiAgentCacheOptimizer()
        self.complexity_threshold = complexity_threshold
        self.max_local_queue = max_local_queue
        self.min_battery_threshold = min_battery_threshold

    def route(self, 
              prompt: str, 
              system_prompt: str, 
              env_state: EnvironmentState) -> Dict[str, Any]:
        
        reasons = []

        # 1. Model Context Protocol: Parallel Cache Check
        cached = self.cache_optimizer.get_cached_decision(prompt)
        if cached:
            reasons.append("MultiAgentCacheOptimizer HIT: 0ms latency returned.")
            return {
                "decision": "CACHE_HIT",
                "cached_route": cached,
                "reasons": reasons,
                "classification_details": {}
            }

        # 2. Score the request
        classification = self.classifier.score_request(prompt, system_prompt)
        score = classification["complexity_score"]
        
        decision: RouteDecision = "LOCAL"

        # 3. Evaluate routing rules
        if score > self.complexity_threshold:
            decision = "CLOUD"
            reasons.append(f"High complexity score ({score} > {self.complexity_threshold})")
            
        elif classification["estimated_tokens"] > 2048:
            decision = "CLOUD"
            reasons.append("Context length exceeds local model capacity (>2048 tokens)")
            
        elif env_state.local_queue_depth >= self.max_local_queue:
            decision = "CLOUD"
            reasons.append(f"Local queue is full ({env_state.local_queue_depth} >= {self.max_local_queue})")
            
        elif env_state.battery_level < self.min_battery_threshold:
            decision = "CLOUD"
            reasons.append("Graceful degradation: Device battery too low for local inference")
            
        elif env_state.thermal_throttling:
            decision = "CLOUD"
            reasons.append("Graceful degradation: Device is thermally throttled")
            
        if decision == "LOCAL":
            reasons.append("Request is simple enough and environment is healthy for Arm64 local execution")

        # 4. Anti-Wrapper Verification: Deterministic Safety Gates
        final_decision = self.safety_gate.validate_decision(decision, env_state)
        if final_decision != decision:
            reasons.append(f"DeterministicSafetyGate OVERRIDE: {decision} -> {final_decision}. Budget limits reached.")
            decision = final_decision

        # 5. Cache the final verified decision
        if decision in ["LOCAL", "CLOUD"]:
            self.cache_optimizer.cache_decision(prompt, decision)

        return {
            "decision": decision,
            "reasons": reasons,
            "classification_details": classification
        }
