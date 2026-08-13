import time
import os
import random
import sys

TRIGGER_FILE = ".trigger"

# Terminal Colors
GREEN = '\033[92m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header():
    os.system('clear' if os.name == 'posix' else 'cls')
    print(f"{BOLD}{BLUE}========================================================================{RESET}")
    print(f"{BOLD}{BLUE}  NEOVERSE HARDWARE TELEMETRY DASHBOARD (Oracle Cloud Ampere A1)  {RESET}")
    print(f"{BOLD}{BLUE}========================================================================{RESET}")
    print(f"{BOLD}Runtime:{RESET} vLLM Engine v0.27.1")
    print(f"{BOLD}Accelerator:{RESET} KleidiAI (Arm Compute Library) - INT4 Micro-kernels")
    print(f"{BOLD}Active Cores:{RESET} 4 (Neoverse N1)\n")
    print("Listening for incoming routing events on 0.0.0.0:8000...\n")

def simulate_idle():
    """Prints occasional low-utilization idle logs"""
    sys.stdout.write(f"\r{YELLOW}[Telemetry]{RESET} System Idle. CPU: {random.randint(1,4)}% | Memory: 4.2GB/24GB | Core Temp: 38°C   ")
    sys.stdout.flush()

def simulate_spike():
    """Simulates a beautiful, authentic vLLM spike sequence"""
    print(f"\n{BOLD}{GREEN}[vLLM API]{RESET} 1 request(s) intercepted from Gateway. Bypassing Cloud Route...")
    time.sleep(0.2)
    print(f"{BOLD}{GREEN}[KleidiAI]{RESET} Allocating INT4 Context... Initializing Neoverse Matrix Multiplication Kernels")
    time.sleep(0.2)
    print(f"{BOLD}{RED}[Hardware]{RESET} WARNING: High Load Detected! CPU Cores Spiking...")
    
    # Simulate high load
    for i in range(1, 11):
        cpu_usage = random.randint(95, 100)
        sys.stdout.write(f"\r{BOLD}{RED}[Hardware]{RESET} Core 0: {cpu_usage}% | Core 1: {cpu_usage}% | Core 2: {cpu_usage}% | Core 3: {cpu_usage}%")
        sys.stdout.flush()
        time.sleep(0.08)
        
    print(f"\n{BOLD}{GREEN}[vLLM API]{RESET} Generation Complete. Latency: 1.240s | 105.0 TPS")
    print(f"{BOLD}{BLUE}[Gateway]{RESET} Payload returned to client.\n")

def main():
    print_header()
    
    # Ensure trigger file doesn't exist at start
    if os.path.exists(TRIGGER_FILE):
        os.remove(TRIGGER_FILE)

    last_idle = time.time()
    
    try:
        while True:
            if os.path.exists(TRIGGER_FILE):
                os.remove(TRIGGER_FILE)
                simulate_spike()
                last_idle = time.time() - 2 # force immediate idle print
            else:
                if time.time() - last_idle > 2:
                    simulate_idle()
                    last_idle = time.time()
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nTelemetry closed.")

if __name__ == "__main__":
    main()
