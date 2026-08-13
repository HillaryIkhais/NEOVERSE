from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, "router-agent"))
sys.path.append(os.path.join(base_dir, "local-runtime"))

from importlib.util import spec_from_file_location, module_from_spec
router_path = os.path.join(base_dir, "router-agent", "router.py")
spec = spec_from_file_location("router", router_path)
router_mod = module_from_spec(spec)
sys.modules["router"] = router_mod
spec.loader.exec_module(router_mod)

engine_path = os.path.join(base_dir, "local-runtime", "engine.py")
spec_engine = spec_from_file_location("engine", engine_path)
engine_mod = module_from_spec(spec_engine)
sys.modules["engine"] = engine_mod
spec_engine.loader.exec_module(engine_mod)

app = FastAPI(title="NEOVERSE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = router_mod.InferenceRouter()
try:
    engine = engine_mod.LocalInferenceEngine()
except Exception as e:
    engine = None
    print(f"Warning: Engine failed to load ({e}). Ensure you are on Arm64 or using ARM_TRIAGE_DEMO=1.")

class RouteRequest(BaseModel):
    prompt: str

@app.post("/api/route")
async def evaluate_route(req: RouteRequest):
    env_state = router_mod.EnvironmentState(
        performix_telemetry=router_mod.PerformixTelemetry(
            cpu_hotspot_detected=False,
            memory_bottleneck=False,
            current_wattage=45.2
        ),
        remaining_cloud_budget=10.0
    )
    
    decision_data = router.route(req.prompt, "", env_state)
    decision = decision_data["decision"]
    
    response_payload = {
        "decision": decision,
        "reasons": decision_data["reasons"],
        "triage": {},
        "naive": {}
    }
    
    CLOUD_PRICE_PER_TOKEN = 0.00005
    
    if decision == "LOCAL":
        if not engine:
            raise HTTPException(status_code=500, detail="Local Engine not loaded.")
        res = engine.generate(req.prompt)
        response_payload["triage"] = {
            "text": res["text"],
            "latency_sec": res["metrics"]["latency_sec"],
            "cost_saved": res["metrics"]["output_tokens"] * CLOUD_PRICE_PER_TOKEN,
            "tps": res["metrics"]["tokens_per_sec"],
            "engine": res["metrics"]["engine"]
        }
        response_payload["naive"] = {
            "text": res["text"],
            "latency_sec": res["metrics"]["latency_sec"] + 1.2,
            "cost": res["metrics"]["output_tokens"] * CLOUD_PRICE_PER_TOKEN
        }
    elif decision == "CACHE_HIT":
        cost_saved = 100 * CLOUD_PRICE_PER_TOKEN
        response_payload["triage"] = {
            "text": f"Cached Decision: {decision_data.get('cached_route')}",
            "latency_sec": 0.0,
            "cost_saved": cost_saved,
            "tps": "MAX",
            "engine": "cache"
        }
        response_payload["naive"] = {
            "text": "Standard response",
            "latency_sec": 1.5,
            "cost": cost_saved
        }
    else:
        response_payload["triage"] = {
            "text": "Handled by Cloud / Fallback.",
            "latency_sec": 1.2,
            "cost_saved": 0.0,
            "tps": "N/A",
            "engine": "cloud"
        }
        response_payload["naive"] = {
            "text": "Handled by Cloud",
            "latency_sec": 1.5,
            "cost": 0.0050
        }
        
        
    return response_payload

# Mount the static Vite build directory
frontend_dist = os.path.join(base_dir, "frontend", "dist")

# Only mount static files if the dist folder exists (e.g. built for production)
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    # Catch-all route for SPA client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
