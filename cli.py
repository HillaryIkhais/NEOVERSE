import argparse
import sys
import os
import subprocess

def serve(args):
    """Launches the full-stack NEOVERSE application."""
    if getattr(args, "demo", False):
        os.environ["NEOVERSE_DEMO"] = "1"
        print("🚨 NEOVERSE_DEMO MODE ACTIVE 🚨")
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, "frontend")
    
    print("🚀 Booting NEOVERSE Full-Stack App...")
    import subprocess
    import time
    try:
        # Start FastAPI backend
        backend_proc = subprocess.Popen(["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"], cwd=base_dir)
        print("Backend started on port 8000.")
        
        # Start Vite frontend
        time.sleep(1) # Give backend a second to bind
        frontend_proc = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)
        print("Frontend started. Open the local Vite URL in your browser!")
        
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers gracefully...")
        backend_proc.terminate()
        frontend_proc.terminate()
    except Exception as e:
        print(f"Failed to start servers: {e}")

def route(args):
    """Executes a headless routing decision."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(base_dir)
    
    try:
        from importlib.util import spec_from_file_location, module_from_spec
        
        # Load the router module directly
        router_path = os.path.join(base_dir, "router-agent", "router.py")
        spec = spec_from_file_location("router", router_path)
        router_mod = module_from_spec(spec)
        sys.modules["router"] = router_mod
        spec.loader.exec_module(router_mod)
        
        # Initialize
        router = router_mod.InferenceRouter()
        
        # We assume nominal hardware state for the CLI test
        env_state = router_mod.EnvironmentState(
            performix_telemetry=router_mod.PerformixTelemetry(
                cpu_hotspot_detected=False,
                memory_bottleneck=False,
                current_wattage=45.2
            ),
            remaining_cloud_budget=10.0
        )
        
        print(f" Request: '{args.prompt}'")
        print(" Analyzing Complexity and Arm Performix Telemetry...\n")
        
        decision_data = router.route(args.prompt, "", env_state)
        
        print("--- ROUTING DECISION ---")
        print(f"Destination:  {decision_data['decision']}")
        print("Reasons:")
        for reason in decision_data['reasons']:
            print(f"  - {reason}")
            
    except Exception as e:
        print(f"Routing failed. Ensure you are running on an OCI Ampere A1 instance. Error: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="NEOVERSE: Enterprise inference router for Arm Neoverse (Oracle Ampere A1)."
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # 'serve' command
    serve_parser = subparsers.add_parser("serve", help="Launch the Full-Stack Web dashboard.")
    serve_parser.add_argument("--demo", action="store_true", help="Bypass vLLM hardware checks to run locally on non-Arm systems.")
    serve_parser.set_defaults(func=serve)
    
    # 'route' command
    route_parser = subparsers.add_parser("route", help="Execute a headless routing decision.")
    route_parser.add_argument("prompt", type=str, help="The input prompt to route.")
    route_parser.set_defaults(func=route)
    
    args = parser.parse_args()
    
    if args.command is None:
        parser.print_help()
    else:
        args.func(args)

if __name__ == "__main__":
    main()
