from collections import deque
from datetime import datetime, timezone
from uuid import uuid4

class HistoryStore:
    def __init__(self, max_items=200): self.items = deque(maxlen=max_items)
    def add(self, text, label, score, available, detector="improved", processing_ms=0):
        item = {"id": str(uuid4()), "text": text, "label": label, "score": score, "available": available, "detector": detector, "processing_ms": processing_ms, "created_at": datetime.now(timezone.utc).isoformat()}
        self.items.appendleft(item); return item
    def list(self): return list(self.items)
    def clear(self): self.items.clear()
