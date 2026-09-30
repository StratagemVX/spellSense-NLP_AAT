import re
from typing import List, Tuple

def split_tokens_with_offsets(text: str) -> List[Tuple[str, int, int, bool]]:
    """
    Splits text into tokens preserving whitespace and punctuation.
    Returns a list of tuples: (token_text, start_offset, end_offset, is_word)
    """
    tokens = []
    # Matches sequences of letters/numbers (words) or punctuation/whitespace
    pattern = re.compile(r"([A-Za-z0-9]+(?:'[A-Za-z0-9]+)?)|([^A-Za-z0-9\s]+)|(\s+)")
    for match in pattern.finditer(text):
        token_str = match.group(0)
        start = match.start()
        end = match.end()
        is_word = bool(match.group(1)) and any(c.isalpha() for c in token_str)
        tokens.append((token_str, start, end, is_word))
    return tokens

def match_casing(original: str, corrected: str) -> str:
    """
    Matches the casing of the corrected word to the original word.
    - All uppercase: HELLO -> WORLD
    - Title case / Capitalized: Hav -> Have
    - Lowercase: hav -> have
    """
    if not corrected or not original:
        return corrected
    if original.isupper() and len(original) > 1:
        return corrected.upper()
    if original[0].isupper():
        return corrected.capitalize()
    return corrected.lower()
