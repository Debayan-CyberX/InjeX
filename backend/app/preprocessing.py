import re
import unicodedata

def normalize_prompt(text: str) -> str:
    """Exact normalization used in the project notebook."""
    if not isinstance(text, str):
        text = str(text)
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"[\u200B-\u200D\uFEFF]", "", text)
    return re.sub(r"\s+", " ", text).strip()
