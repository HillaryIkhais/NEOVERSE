import sys
import os
import time
import importlib.util

# Setup imports for hyphenated directories
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

def load_module(name, path):
    full_path = os.path.join(base_dir, path)
    spec = importlib.util.spec_from_file_location(name, full_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module

classifier_mod = load_module("classifier", "router-agent/classifier.py")
router_mod = load_module("router", "router-agent/router.py")
engine_mod = load_module("engine", "local-runtime/engine.py")
tracer_mod = load_module("tracer", "telemetry/tracer.py")

def main():
    print("🚀 Starting Arm-Native Multi-Agent Inference Router Demo\n")
    
    router = router_mod.InferenceRouter()
    engine = engine_mod.LocalInferenceEngine()
    tracer = tracer_mod.TelemetryTracer()
    
    prompts = [
        "What is the capital of France?",
        "Write a comprehensive system architecture for a globally distributed database, including trade-offs for consistency and availability.",
        "def calculate_fibonacci(n):\n    if n <= 1: return n\n    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)",
    ]
    
    for i, prompt in enumerate(prompts):
        print(f"\n--- Request {i+1} ---")
        print(f"Prompt: '{prompt[:60]}...'")
        
        env_state = router_mod.EnvironmentState(
            local_queue_depth=0,
            battery_level=0.8,
            thermal_throttling=False,
            remaining_cloud_budget=10.0
        )
        
        with tracer.start_span(f"request_{i+1}", {"prompt_length": len(prompt)}) as span:
            decision_data = router.route(prompt, "", env_state)
            decision = decision_data["decision"]
            score = decision_data["classification_details"]["complexity_score"]
            
            print(f"🧠 Complexity Score: {score}/10.0")
            print(f"🔀 Routing Decision: {decision} ({decision_data['reasons'][-1]})")
            
            if decision == "LOCAL":
                with tracer.start_span("local_inference"):
                    res = engine.generate(prompt)
                    print(f"⚡ Local Inference Engine used: {res['metrics']['engine']}")
                    print(f"⏱️  Latency: {res['metrics']['latency_sec']}s")
            else:
                with tracer.start_span("cloud_inference"):
                    print("☁️  Forwarded to Cloud API Fallback.")
                    time.sleep(0.8) # Simulate cloud latency

if __name__ == "__main__":
    main()
