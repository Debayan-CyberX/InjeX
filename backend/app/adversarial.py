import random
import re
from typing import Callable

def char_substitution(text: str) -> str:
    substitutions = {"a": ["@", "ɑ"], "e": ["3", "е"], "i": ["1", "і"], "o": ["0", "ο"], "s": ["$", "ѕ"], "t": ["7"]}
    chars, indices = list(text), list(range(len(text)))
    random.shuffle(indices)
    changes, changed = max(1, int(len(chars) * .04)), 0
    for i in indices:
        if chars[i].lower() in substitutions:
            chars[i] = random.choice(substitutions[chars[i].lower()])
            changed += 1
        if changed >= changes: break
    return "".join(chars)

def spacing_obfuscation(text: str) -> str:
    words = []
    for word in text.split():
        if len(word) > 5 and random.random() < .35:
            p = len(word) // 2
            word = word[:p] + " " + word[p:]
        words.append(word)
    return " ".join(words)

def punctuation_obfuscation(text: str) -> str:
    replacements = {"ignore": "ignore...", "previous": "previous!!!", "instruction": "instruction???", "system": "system::", "prompt": "prompt---"}
    for old, new in replacements.items():
        if random.random() < .5:
            text = re.sub(rf"\b{old}\b", new, text, flags=re.IGNORECASE)
    return text

def instruction_splitting(text: str) -> str:
    if len(text.split()) < 4: return text
    return " ".join((w[:len(w)//2] + " " + w[len(w)//2:]) if len(w) >= 6 and random.random() < .25 else w for w in text.split())

def unicode_obfuscation(text: str) -> str:
    mapping = {"a": "а", "c": "с", "e": "е", "o": "о", "p": "р", "x": "х"}
    return "".join(mapping.get(c.lower(), c) if c.lower() in mapping and random.random() < .08 else c for c in text)

TRANSFORMATIONS: list[Callable[[str], str]] = [char_substitution, spacing_obfuscation, punctuation_obfuscation, instruction_splitting, unicode_obfuscation]

def adversarial_transform(text: str) -> str:
    result = text
    for transform in random.sample(TRANSFORMATIONS, random.randint(2, 4)):
        result = transform(result)
    return result
