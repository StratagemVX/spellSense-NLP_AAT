import os
import time
import math
import importlib.resources
from typing import List, Dict, Any, Optional, Tuple
from symspellpy import SymSpell, Verbosity
from app.utils.text_utils import split_tokens_with_offsets, match_casing

class SymSpellEngine:
    _instance: Optional['SymSpellEngine'] = None

    def __init__(self, max_dictionary_edit_distance: int = 2, prefix_length: int = 7):
        self.max_dictionary_edit_distance = max_dictionary_edit_distance
        self.prefix_length = prefix_length
        self.sym_spell = SymSpell(
            max_dictionary_edit_distance=max_dictionary_edit_distance,
            prefix_length=prefix_length
        )
        self._is_loaded = False
        self._cache: Dict[str, List[Dict[str, Any]]] = {}
        self._load_dictionaries()

    @classmethod
    def get_instance(cls) -> 'SymSpellEngine':
        if cls._instance is None:
            cls._instance = SymSpellEngine()
        return cls._instance

    def _load_dictionaries(self):
        if self._is_loaded:
            return
        try:
            pkg_dir = importlib.resources.files("symspellpy")
            dict_path = str(pkg_dir.joinpath("frequency_dictionary_en_82_765.txt"))
            bigram_path = str(pkg_dir.joinpath("frequency_bigramdictionary_en_243_342.txt"))

            if os.path.exists(dict_path):
                self.sym_spell.load_dictionary(dict_path, term_index=0, count_index=1)
            if os.path.exists(bigram_path):
                self.sym_spell.load_bigram_dictionary(bigram_path, term_index=0, count_index=2)
            
            self._is_loaded = True
        except Exception as e:
            print(f"Warning: Failed to load SymSpell dictionary: {e}")
            self._is_loaded = False

    @property
    def is_ready(self) -> bool:
        return self._is_loaded and len(self.sym_spell.words) > 0

    @property
    def word_count(self) -> int:
        return len(self.sym_spell.words)

    def is_word_in_dict(self, word: str) -> bool:
        return word.lower() in self.sym_spell.words

    def lookup_word(
        self,
        word: str,
        max_edit_distance: int = 2,
        prev_word: Optional[str] = None,
        next_word: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        clean_word = word.lower().strip()
        if not clean_word or not self.is_ready:
            return []

        # Fast path 1: Exact match with known dictionary word (edit distance 0)
        # Exception: single character 'i' or 'a' are words; other words with positive frequency
        if clean_word in self.sym_spell.words and (len(clean_word) > 1 or clean_word in {'i', 'a'}):
            cnt = self.sym_spell.words[clean_word]
            return [{
                "term": clean_word,
                "distance": 0,
                "count": cnt,
                "score": 1.0,
                "total_metric": 1.0,
                "bigram_boost": 0.0
            }]

        cache_key = f"{clean_word}_{prev_word or ''}_{next_word or ''}_{max_edit_distance}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        suggestions = self.sym_spell.lookup(
            clean_word,
            Verbosity.CLOSEST,
            max_edit_distance=max_edit_distance,
            include_unknown=True
        )

        # If no suggestions found with CLOSEST, fallback to ALL distance <= 2
        if not suggestions:
            suggestions = self.sym_spell.lookup(
                clean_word,
                Verbosity.ALL,
                max_edit_distance=max_edit_distance,
                include_unknown=True
            )

        candidates = []
        for s in suggestions[:8]:
            term = s.term
            dist = s.distance
            count = s.count

            if dist == 0:
                base_score = 1.0
            else:
                log_freq = math.log10(max(count, 1))
                freq_ratio = min(1.0, log_freq / 9.5)
                base = 0.70 if dist == 1 else 0.45
                base_score = base + 0.15 * freq_ratio

            # Contextual Bigram Enhancement
            bigram_boost = 0.0
            if prev_word:
                prev_clean = prev_word.lower().strip()
                bi_key_prev = f"{prev_clean} {term}"
                if bi_key_prev in self.sym_spell.bigrams:
                    bi_cnt = self.sym_spell.bigrams[bi_key_prev]
                    bigram_boost += 0.12 * min(1.0, math.log10(max(bi_cnt, 1)) / 9.5)

            if next_word:
                next_clean = next_word.lower().strip()
                bi_key_next = f"{term} {next_clean}"
                if bi_key_next in self.sym_spell.bigrams:
                    bi_cnt = self.sym_spell.bigrams[bi_key_next]
                    bigram_boost += 0.12 * min(1.0, math.log10(max(bi_cnt, 1)) / 9.5)

            total_metric = base_score + bigram_boost
            display_score = round(min(0.99, total_metric) if dist > 0 else 1.0, 4)

            candidates.append({
                "term": term,
                "distance": dist,
                "count": count,
                "score": display_score,
                "total_metric": total_metric,
                "bigram_boost": round(bigram_boost, 4)
            })

        candidates.sort(key=lambda x: (x["distance"], -x["total_metric"]))
        if len(self._cache) < 2000:
            self._cache[cache_key] = candidates
        return candidates

    def get_symmetric_deletes(self, word: str, max_distance: int = 2) -> List[str]:
        w = word.lower().strip()
        deletes = set()
        
        # Distance 1 deletes
        d1 = set()
        for i in range(len(w)):
            d = w[:i] + w[i+1:]
            if d:
                d1.add(d)
        deletes.update(d1)

        # Distance 2 deletes if requested
        if max_distance >= 2:
            for item in d1:
                for i in range(len(item)):
                    d2 = item[:i] + item[i+1:]
                    if d2:
                        deletes.add(d2)

        return sorted(list(deletes))

    def correct_text(self, text: str) -> Tuple[str, List[Dict[str, Any]], float]:
        start_time = time.perf_counter()
        tokens = split_tokens_with_offsets(text)
        corrected_tokens = []
        corrections = []

        word_indices = [i for i, t in enumerate(tokens) if t[3]]

        for idx, (token_str, start, end, is_word) in enumerate(tokens):
            if not is_word:
                corrected_tokens.append(token_str)
                continue

            clean_lower = token_str.lower()

            pos_in_words = word_indices.index(idx) if idx in word_indices else -1
            prev_w = tokens[word_indices[pos_in_words - 1]][0] if pos_in_words > 0 else None
            next_w = tokens[word_indices[pos_in_words + 1]][0] if (0 <= pos_in_words < len(word_indices) - 1) else None

            suggestions = self.lookup_word(
                clean_lower,
                max_edit_distance=self.max_dictionary_edit_distance,
                prev_word=prev_w,
                next_word=next_w
            )

            if suggestions:
                best = suggestions[0]
                best_term = match_casing(token_str, best["term"])
                is_changed = (best_term.lower() != token_str.lower())
                distance = best["distance"]
                confidence = best["score"]
            else:
                best_term = token_str
                is_changed = False
                distance = 0
                confidence = 1.0

            corrected_tokens.append(best_term)

            corrections.append({
                "original": token_str,
                "corrected": best_term,
                "is_changed": is_changed,
                "distance": distance,
                "confidence": confidence,
                "start": start,
                "end": end,
                "candidates": suggestions[:5]
            })

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return "".join(corrected_tokens), corrections, round(elapsed_ms, 3)
