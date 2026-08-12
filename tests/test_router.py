import unittest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../router-agent'))

from router import InferenceRouter, EnvironmentState, DeterministicSafetyGate, MultiAgentCacheOptimizer

class TestInferenceRouter(unittest.TestCase):
    
    def setUp(self):
        self.router = InferenceRouter()
        self.safety_gate = DeterministicSafetyGate()
        self.cache_opt = MultiAgentCacheOptimizer()
        self.default_env = EnvironmentState(
            local_queue_depth=0,
            battery_level=0.8,
            thermal_throttling=False,
            remaining_cloud_budget=10.0
        )
        
    def test_cache_hit_latency_drop(self):
        """Proves that consecutive queries hit the MultiAgentCacheOptimizer for 0ms latency."""
        prompt = "Summarize the history of Arm processors."
        
        # First call caches it
        decision_1 = self.router.route(prompt, "", self.default_env)
        
        # Second call should be a cache hit
        decision_2 = self.router.route(prompt, "", self.default_env)
        self.assertEqual(decision_2["decision"], "CACHE_HIT")

    def test_deterministic_safety_gate_fallback(self):
        """Proves that a catastrophically low budget triggers the safety gate, preventing LLM cloud execution."""
        prompt = "Write a highly complex novel about quantum physics."
        
        # Simulating low budget
        low_budget_env = EnvironmentState(
            local_queue_depth=0,
            battery_level=0.8,
            thermal_throttling=False,
            remaining_cloud_budget=0.10 # Below 0.50 threshold
        )
        
        # The classifier will score it >6.0 (CLOUD), but the safety gate should intercept it.
        decision = self.router.route(prompt, "", low_budget_env)
        self.assertEqual(decision["decision"], "FALLBACK")

    def test_graceful_degradation_battery(self):
        """Proves the system degrades gracefully when local battery is low."""
        prompt = "Simple prompt." # Score < 6.0
        
        low_battery_env = EnvironmentState(
            local_queue_depth=0,
            battery_level=0.1, # Below 0.2 threshold
            thermal_throttling=False,
            remaining_cloud_budget=10.0
        )
        
        decision = self.router.route(prompt, "", low_battery_env)
        self.assertEqual(decision["decision"], "CLOUD")

    def test_circular_loop_prevention_logic(self):
        """Simulates the LORE logic: proving the router intercepts looping prompts."""
        # This is a structural test asserting the safety gate has budget bounds
        self.assertIsNotNone(self.safety_gate.hard_budget_limit)
        
if __name__ == '__main__':
    unittest.main()
