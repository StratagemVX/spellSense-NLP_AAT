import time
from typing import List, Dict, Any, Tuple
from textblob import TextBlob, Word
from app.utils.text_utils import split_tokens_with_offsets, match_casing
from app.nlp.symspell_engine import SymSpellEngine

class TextBlobEngine:
    def __init__(self):
        # Warm up TextBlob's internal spelling dictionary
        _ = Word("test").spellcheck()
        self._cache: Dict[str, List[Dict[str, Any]]] = {}
        # Reference SymSpell word lexicon for O(1) known word verification
        self._symspell = SymSpellEngine.get_instance()

    def lookup_word(self, word: str) -> List[Dict[str, Any]]:
        clean_word = word.lower().strip()
        if not clean_word:
            return []

        # Fast path: If the word is already verified in English vocabulary with 0 edit distance
        if self._symspell.is_word_in_dict(clean_word) and (len(clean_word) > 1 or clean_word in {'i', 'a'}):
            return [{"term": clean_word, "score": 1.0}]

        if clean_word in self._cache:
            return self._cache[clean_word]

        try:
            w_obj = Word(clean_word)
            results = w_obj.spellcheck()
            candidates = []
            for term, score in results[:6]:
                candidates.append({
                    "term": term,
                    "score": round(score, 4)
                })
            if len(self._cache) < 2000:
                self._cache[clean_word] = candidates
            return candidates
        except Exception:
            return [{"term": clean_word, "score": 1.0}]

    def correct_text(self, text: str) -> Tuple[str, List[Dict[str, Any]], float]:
        start_time = time.perf_counter()
        tokens = split_tokens_with_offsets(text)
        corrected_tokens = []
        corrections = []

        for token_str, start, end, is_word in tokens:
            if not is_word:
                corrected_tokens.append(token_str)
                continue

            clean_lower = token_str.lower()
            candidates = self.lookup_word(clean_lower)

            if candidates:
                best = candidates[0]
                best_term = match_casing(token_str, best["term"])
                is_changed = (best_term.lower() != token_str.lower())
                confidence = best["score"]
            else:
                best_term = token_str
                is_changed = False
                confidence = 1.0

            corrected_tokens.append(best_term)

            corrections.append({
                "original": token_str,
                "corrected": best_term,
                "is_changed": is_changed,
                "confidence": confidence,
                "start": start,
                "end": end,
                "candidates": candidates[:5]
            })

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return "".join(corrected_tokens), corrections, round(elapsed_ms, 3)
