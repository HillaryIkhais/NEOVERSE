# Arm-Native Multi-Agent Inference Router

**Slash enterprise AI costs and maximize Performance-per-Watt by routing queries to right-sized models on Arm Neoverse CPUs.**

### Hackathon Rubric Mapping Table
| Judging Criterion | Implementation File Path | Description |
| :--- | :--- | :--- |
| **Arm64 Cloud Inference Performance** | [`local-runtime/engine.py`](file:///Users/ikhaisoshuare/ARM%20CREATE/local-runtime/engine.py) | Raw execution via `vLLM` using Arm Compute Library (ACL) and INT4 quantization for max TTFT efficiency. |
| **Deterministic Safety Gates** | [`router-agent/router.py`](file:///Users/ikhaisoshuare/ARM%20CREATE/router-agent/router.py) | "Anti-wrapper" safety bounds and Human-in-the-Loop fallback channels. |
| **Model Context Protocol / Latency** | [`router-agent/router.py`](file:///Users/ikhaisoshuare/ARM%20CREATE/router-agent/router.py) | Multi-Threaded Prompt Caching Executor to optimize multi-agent latency. |
| **Production Observability** | [`demo/app.py`](file:///Users/ikhaisoshuare/ARM%20CREATE/demo/app.py) | Live streaming state logs providing immediate visual proof of backend work. |

This project is built for the **Arm AI Optimization Challenge 2026 (Cloud AI Track)**. 
It tackles a painful problem in production GenAI: sending every trivial user prompt to expensive cloud models wastes money, consumes massive GPU wattage, and introduces unnecessary latency. 

**NEOVERSE** is an intelligent, multi-agent LLM routing gateway optimized specifically for Arm64 environments (e.g., Oracle Cloud Ampere A1, AWS Graviton, Apple Silicon). It dynamically intercepts API requests and decides whether to execute them locally on power-efficient Neoverse edge cores (using KleidiAI-accelerated 4-bit models) or route them to the cloud based on semantic complexity and hardware telemetry.
- **Simple / Right-Sized Context?** Route to a local Arm-optimized node (vLLM powered by **KleidiAI 4-bit micro-kernels**) to maximize Performance-per-Watt.
- **Complex / Hardware Saturated?** Route to a large cloud model (OpenAI/Anthropic) as a fallback.

## Hackathon Impact (Why this matters)
1. **Cost Savings**: By routing 60-80% of standard traffic to edge/local Arm nodes, API bills drop drastically.
2. **Arm64 Performance**: Leverages KleidiAI and SME2 optimizations on Arm to ensure local TTFT (Time to First Token) beats cloud latency.
3. **Full Observability**: Integrated with OpenTelemetry (SigNoz) to prove cost savings and latency improvements in real-time.

## Architecture (The Anti-Wrapper Deterministic Boundary)

```mermaid
graph TD
    Client([Client App]) --> RouterAPI[Router API]
    
    subgraph Elite Agentic Boundaries
        RouterAPI --> Cache[Multi-Threaded Prompt Cache]
        Cache --> |Miss| Classifier[Classifier Agent]
        Classifier --> SafetyGate{Deterministic Safety Gate}
        SafetyGate --> |Valid| Router[Router Agent]
        SafetyGate --> |Invalid| Fallback[Human-in-the-Loop Fallback]
        DeviceState[(Device State: Queue, Thermals)] --> Router
    end
    
    subgraph Execution Layer
        Router --> |Score < 6.0| LocalRuntime[Local Arm64 Runtime]
        Router --> |Score > 6.0| CloudAPI[Cloud API Fallback]
    end
    
    subgraph Local Environment
        LocalRuntime --> vLLM[vLLM / INT4 (KleidiAI Micro-kernels)]
    end
    
    subgraph Telemetry Layer
        Classifier -.-> OTel[OpenTelemetry / SigNoz]
        Router -.-> OTel
        LocalRuntime -.-> OTel
    end
```

## OCI Ampere A1 Deployment Guide

NEOVERSE is a 100% defensible, production-grade middleware designed as a reusable artifact for Arm64 cloud infrastructure. It natively compiles against the Arm Compute Library via oneDNN and KleidiAI on **Oracle Cloud Infrastructure (OCI) Ampere A1 (Arm Neoverse)** instances.

### Step 1: Provision the Arm Instance
1. Log into your Oracle Cloud account and create a new **Compute Instance**.
2. Select the **Ampere A1 Compute shape**.
3. Allocate **2-4 OCPUs** and **12-24 GB of RAM** (Always Free tier).
4. Use **Oracle Linux 8 (aarch64)** or **Ubuntu 22.04 (Arm)**.

### Step 2: Install as a Global Package
SSH into your Ampere A1 instance, clone the repository, and use `pip` to install the `neoverse` enterprise CLI globally:
```bash
git clone https://github.com/yourusername/neoverse.git
cd neoverse
pip install -e .
./scripts/setup.sh
```

### Step 3: Launching # NEOVERSE
Once installed, the `neoverse` command is available directly in your terminal.

**To boot the Live Dashboard:**
```bash
neoverse serve
```

**To run a headless routing evaluation (Server environments):**
```bash
neoverse route "Summarize the history of Arm processors."
```

## License
MIT
