import time
import logging
from langchain_core.callbacks import BaseCallbackHandler

logger = logging.getLogger(__name__)


class MetricsCallbackHandler(BaseCallbackHandler):
    """Track LLM latency and token usage per call."""

    def __init__(self):
        super().__init__()
        self._start_times: dict[str, float] = {}
        self.latency_ms: float = 0
        self.input_tokens: int = 0
        self.output_tokens: int = 0
        self.total_tokens: int = 0

    def on_chat_model_start(self, serialized, messages, *, run_id, **kwargs):
        self._start_times[str(run_id)] = time.monotonic()

    def on_llm_end(self, response, *, run_id, **kwargs):
        run_id_str = str(run_id)
        start = self._start_times.pop(run_id_str, None)
        if start is not None:
            self.latency_ms = round((time.monotonic() - start) * 1000)

        for gen_list in response.generations:
            for gen in gen_list:
                msg = gen.message
                usage = getattr(msg, "usage_metadata", None)
                if usage:
                    self.input_tokens = usage.get("input_tokens", 0)
                    self.output_tokens = usage.get("output_tokens", 0)
                    self.total_tokens = usage.get("total_tokens", 0)
                    return

    def on_llm_error(self, error, *, run_id, **kwargs):
        self._start_times.pop(str(run_id), None)
        logger.error("LLM error: %s", error)

    def get_metrics(self) -> dict:
        return {
            "latency_ms": self.latency_ms,
            "tokens": {
                "input": self.input_tokens,
                "output": self.output_tokens,
                "total": self.total_tokens,
            },
        }
