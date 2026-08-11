import streamlit as st
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

# Load our agents
classifier_mod = load_module("classifier", "router-agent/classifier.py")
router_mod = load_module("router", "router-agent/router.py")
engine_mod = load_module("engine", "local-runtime/engine.py")

@st.cache_resource
def load_system():
    router = router_mod.InferenceRouter()
    engine = engine_mod.LocalInferenceEngine()
    return router, engine

st.set_page_config(page_title="Arm-Native Inference Router", layout="wide")

router, engine = load_system()

# State
if "history" not in st.session_state:
    st.session_state.history = []
if "savings" not in st.session_state:
    st.session_state.savings = 0.0
if "local_count" not in st.session_state:
    st.session_state.local_count = 0
if "cloud_count" not in st.session_state:
    st.session_state.cloud_count = 0

st.title("⚡ Arm-Native Multi-Agent Inference Router")
st.markdown("### *Save up to 100% of LLM API costs on simple queries, without sacrificing quality on hard ones.*")

col1, col2 = st.columns([3, 1])

with col2:
    st.markdown("### 📊 Live Telemetry")
    st.metric(label="Total Savings (vs Cloud)", value=f"${st.session_state.savings:.4f}")
    st.metric(label="Requests Handled Locally", value=f"{st.session_state.local_count}")
    st.metric(label="Requests Sent to Cloud", value=f"{st.session_state.cloud_count}")
    
    st.markdown("---")
    st.markdown("**Simulated Device State**")
    queue_depth = st.slider("Local Queue Depth", 0, 10, 0)
    battery = st.slider("Battery Level", 0.0, 1.0, 0.8)
    
    env_state = router_mod.EnvironmentState(
        local_queue_depth=queue_depth,
        battery_level=battery,
        thermal_throttling=False,
        remaining_cloud_budget=10.0
    )

with col1:
    # Render history
    for msg in st.session_state.history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if "meta" in msg:
                st.caption(msg["meta"])

    user_input = st.chat_input("Enter a prompt...")
    
    if user_input:
        st.session_state.history.append({"role": "user", "content": user_input})
        
        with st.chat_message("user"):
            st.markdown(user_input)
            
        with st.status("Agentic Routing Trace...", expanded=True) as status:
            st.write("Evaluating complexity and safety boundaries...")
            decision_data = router.route(user_input, "", env_state)
            decision = decision_data["decision"]
            reasons = decision_data["reasons"]
            score = decision_data.get("classification_details", {}).get("complexity_score", "N/A")
            
            for reason in reasons:
                st.write(f"> {reason}")
                time.sleep(0.3)
                
            status.update(label=f"Route Locked: {decision}", state="complete", expanded=False)
            
            if decision == "LOCAL":
                res = engine.generate(user_input)
                response_text = res["text"]
                latency = res["metrics"]["latency_sec"]
                tokens = res["metrics"]["output_tokens"]
                tps = res["metrics"]["tokens_per_sec"]
                
                cost_saved = tokens * 0.0005
                st.session_state.savings += cost_saved
                st.session_state.local_count += 1
                meta_info = f"⚡ **Routed: LOCAL** (Score: {score}/10) | Latency: {latency}s | Speed: {tps} t/s | Saved: ${cost_saved:.4f}"
                
            elif decision == "CACHE_HIT":
                response_text = f"Simulated fast response via local cached route: {decision_data.get('cached_route')}."
                cost_saved = 100 * 0.0005 # Mock savings
                st.session_state.savings += cost_saved
                st.session_state.local_count += 1
                meta_info = f"⚡ **Routed: CACHE_HIT** (Latency: 0ms) | Saved: ${cost_saved:.4f}"
                
            elif decision == "FALLBACK":
                response_text = "Human-in-the-Loop Intervention required. Cloud budget limits exceeded and request requires safety override."
                meta_info = f"🛑 **Routed: FALLBACK** | Reason: Deterministic Safety Gate triggered."
                
            else:
                time.sleep(1.2) # Simulate cloud latency
                response_text = "This request was handled by Cloud API fallback."
                st.session_state.cloud_count += 1
                meta_info = f"☁️ **Routed: CLOUD** (Score: {score}/10) | Reason: {reasons[-1]}"
        
        st.session_state.history.append({"role": "assistant", "content": response_text, "meta": meta_info})
        st.rerun()
