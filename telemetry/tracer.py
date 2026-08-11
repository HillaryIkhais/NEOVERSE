import time
from contextlib import contextmanager

class TelemetryTracer:
    """
    A lightweight wrapper simulating OpenTelemetry (OTel) instrumentation.
    In a complete implementation, this integrates with opentelemetry-api and 
    exports semantic spans to a backend like SigNoz to trace routing decisions,
    latency, and cost deltas against an always-cloud baseline.
    """
    def __init__(self, service_name: str = "arm-inference-router"):
        self.service_name = service_name
        self.traces = []

    @contextmanager
    def start_span(self, name: str, attributes: dict = None):
        """
        Context manager to create a trace span for a specific operation.
        """
        if attributes is None:
            attributes = {}
            
        start_time = time.time()
        span_data = {
            "name": name,
            "attributes": attributes,
            "events": []
        }
        
        try:
            yield span_data
        except Exception as e:
            span_data["events"].append({"name": "exception", "message": str(e)})
            raise
        finally:
            end_time = time.time()
            span_data["duration_ms"] = round((end_time - start_time) * 1000, 2)
            self.traces.append(span_data)
            # Simulating export to SigNoz UI
            print(f"[SigNoz OTel] Span '{name}' recorded: {span_data['duration_ms']}ms")

    def get_traces(self):
        return self.traces
