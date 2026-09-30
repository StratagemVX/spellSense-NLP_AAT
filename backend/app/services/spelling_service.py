from typing import Dict, Any, List
from app.nlp.textblob_engine import TextBlobEngine
from app.nlp.symspell_engine import SymSpellEngine
from app.nlp.comparison import compare_corrections
from app.models.schemas import (
    CorrectionResponse,
    CorrectionStatistics,
    SingleWordAnalysisResponse,
    DecisionStep,
    CorrectionItem,
    CandidateItem
)
from app.utils.text_utils import match_casing

class SpellingService:
    def __init__(self):
        self.textblob_engine = TextBlobEngine()
        self.symspell_engine = SymSpellEngine.get_instance()

    def correct(self, text: str, algorithm: str = "compare") -> CorrectionResponse:
        algo = algorithm.lower().strip() if algorithm else "compare"

        # 1. SymSpell Only Mode
        if algo == "symspell":
            ss_text, ss_corrections, ss_time = self.symspell_engine.correct_text(text)
            total_words = len(ss_corrections)
            errors = sum(1 for c in ss_corrections if c["is_changed"])

            items: List[CorrectionItem] = []
            for i, c in enumerate(ss_corrections):
                c_items = [
                    CandidateItem(term=cand["term"], score=cand["score"], distance=cand.get("distance"), engine="SymSpell")
                    for cand in c.get("candidates", [])
                ]
                conf_level = "High" if c["confidence"] >= 0.85 else ("Medium" if c["confidence"] >= 0.60 else "Low")
                items.append(
                    CorrectionItem(
                        id=i + 1,
                        original=c["original"],
                        is_mistake=c["is_changed"],
                        textblob_correction=c["corrected"],
                        textblob_confidence=c["confidence"],
                        symspell_correction=c["corrected"],
                        symspell_confidence=c["confidence"],
                        symspell_distance=c.get("distance", 0),
                        recommended=c["corrected"],
                        chosen_algorithm="SymSpell",
                        confidence_level=conf_level,
                        start_char=c["start"],
                        end_char=c["end"],
                        textblob_candidates=[],
                        symspell_candidates=c_items,
                        explanation=f"Corrected by SymSpell (edit distance {c.get('distance', 0)})." if c["is_changed"] else "Word verified in vocabulary."
                    )
                )

            stats = CorrectionStatistics(
                total_words=total_words,
                total_characters=len(text),
                textblob_error_count=0,
                symspell_error_count=errors,
                total_corrections_made=errors,
                textblob_time_ms=0.0,
                symspell_time_ms=ss_time,
                total_time_ms=ss_time,
                speedup_ratio=1.0,
                agreement_percentage=100.0,
                words_corrected_percentage=round((errors / max(total_words, 1)) * 100.0, 1)
            )

            return CorrectionResponse(
                original_text=text,
                textblob_result=ss_text,
                symspell_result=ss_text,
                recommended_result=ss_text,
                corrections=items,
                statistics=stats,
                processing_time_ms=ss_time,
                pipeline_trace=[],
                applied_algorithm="symspell"
            )

        # 2. TextBlob Only Mode
        elif algo == "textblob":
            tb_text, tb_corrections, tb_time = self.textblob_engine.correct_text(text)
            total_words = len(tb_corrections)
            errors = sum(1 for c in tb_corrections if c["is_changed"])

            items: List[CorrectionItem] = []
            for i, c in enumerate(tb_corrections):
                c_items = [
                    CandidateItem(term=cand["term"], score=cand["score"], engine="TextBlob")
                    for cand in c.get("candidates", [])
                ]
                conf_level = "High" if c["confidence"] >= 0.85 else ("Medium" if c["confidence"] >= 0.60 else "Low")
                items.append(
                    CorrectionItem(
                        id=i + 1,
                        original=c["original"],
                        is_mistake=c["is_changed"],
                        textblob_correction=c["corrected"],
                        textblob_confidence=c["confidence"],
                        symspell_correction=c["corrected"],
                        symspell_confidence=c["confidence"],
                        symspell_distance=1 if c["is_changed"] else 0,
                        recommended=c["corrected"],
                        chosen_algorithm="TextBlob",
                        confidence_level=conf_level,
                        start_char=c["start"],
                        end_char=c["end"],
                        textblob_candidates=c_items,
                        symspell_candidates=[],
                        explanation=f"Corrected by TextBlob (Norvig Bayes probability)." if c["is_changed"] else "Word verified in vocabulary."
                    )
                )

            stats = CorrectionStatistics(
                total_words=total_words,
                total_characters=len(text),
                textblob_error_count=errors,
                symspell_error_count=0,
                total_corrections_made=errors,
                textblob_time_ms=tb_time,
                symspell_time_ms=0.0,
                total_time_ms=tb_time,
                speedup_ratio=1.0,
                agreement_percentage=100.0,
                words_corrected_percentage=round((errors / max(total_words, 1)) * 100.0, 1)
            )

            return CorrectionResponse(
                original_text=text,
                textblob_result=tb_text,
                symspell_result=tb_text,
                recommended_result=tb_text,
                corrections=items,
                statistics=stats,
                processing_time_ms=tb_time,
                pipeline_trace=[],
                applied_algorithm="textblob"
            )

        # 3. Compare Both Mode (Default)
        else:
            tb_text, tb_corrections, tb_time = self.textblob_engine.correct_text(text)
            ss_text, ss_corrections, ss_time = self.symspell_engine.correct_text(text)

            comparison_data = compare_corrections(
                text=text,
                tb_text=tb_text,
                tb_corrections=tb_corrections,
                tb_time_ms=tb_time,
                ss_text=ss_text,
                ss_corrections=ss_corrections,
                ss_time_ms=ss_time
            )

            total_elapsed = round(tb_time + ss_time, 3)
            stats: CorrectionStatistics = comparison_data["statistics"]
            stats.total_time_ms = total_elapsed

            return CorrectionResponse(
                original_text=text,
                textblob_result=tb_text,
                symspell_result=ss_text,
                recommended_result=comparison_data["recommended_text"],
                corrections=comparison_data["corrections"],
                statistics=stats,
                processing_time_ms=total_elapsed,
                pipeline_trace=comparison_data["pipeline_trace"],
                applied_algorithm="compare"
            )

    def analyze_single_word(self, word: str, max_distance: int = 2) -> SingleWordAnalysisResponse:
        w_clean = word.strip()
        ss_cands = self.symspell_engine.lookup_word(w_clean, max_edit_distance=max_distance)
        tb_cands = self.textblob_engine.lookup_word(w_clean)
        sym_deletes = self.symspell_engine.get_symmetric_deletes(w_clean, max_distance=max_distance)
        is_in_dict = self.symspell_engine.is_word_in_dict(w_clean)

        best_cand = ss_cands[0]["term"] if ss_cands else (tb_cands[0]["term"] if tb_cands else w_clean)
        best_cand_cased = match_casing(w_clean, best_cand)
        best_distance = ss_cands[0]["distance"] if ss_cands else 0
        candidate_terms = [c["term"] for c in ss_cands[:6]]

        # Human-readable step-by-step decision explanation
        decision_steps = [
            DecisionStep(
                step_name="1. Incorrect Word",
                value=w_clean,
                description=f"The input term '{w_clean}' was detected as misspelled (not found in the 82,765 English lexicon)." if not is_in_dict else f"The input term '{w_clean}' is already verified with 0 edit distance."
            ),
            DecisionStep(
                step_name="2. Candidate Generation",
                value=", ".join(candidate_terms) if candidate_terms else "None",
                description=f"Generated {len(sym_deletes)} symmetric delete keys and looked up candidate terms within distance <= {max_distance}."
            ),
            DecisionStep(
                step_name="3. Edit Distance",
                value=f"Distance = {best_distance}",
                description=f"Requires {best_distance} character transformation{'s' if best_distance != 1 else ''} to convert '{w_clean}' into '{best_cand_cased}'."
            ),
            DecisionStep(
                step_name="4. Selected Correction",
                value=best_cand_cased,
                description=f"Selected '{best_cand_cased}' because it has minimal edit distance ({best_distance}) and highest unigram/bigram frequency."
            )
        ]

        explanation = (
            f"SymSpell evaluated {len(sym_deletes)} symmetric delete keys for '{w_clean}'. "
            f"Selected '{best_cand_cased}' with edit distance {best_distance}."
        )

        comp_note = (
            f"SymSpell evaluated {len(ss_cands)} candidates via O(1) hash table lookup. "
            f"TextBlob evaluated Norvig's probability model candidate set."
        )

        return SingleWordAnalysisResponse(
            word=w_clean,
            is_correct=is_in_dict,
            selected_correction=best_cand_cased,
            edit_distance=best_distance,
            candidate_generation=candidate_terms,
            decision_steps=decision_steps,
            edit_distance_explained=explanation,
            symspell_deletes=sym_deletes[:12],
            symspell_candidates=ss_cands,
            textblob_candidates=tb_cands,
            best_candidate=best_cand_cased,
            algorithm_comparison_note=comp_note
        )

    def get_preset_examples(self) -> List[Dict[str, str]]:
        return [
            {
                "id": "basic",
                "title": "Basic Everyday Mistakes",
                "badge": "Everyday",
                "text": "I hav a beutiful day and I am goin to the markat."
            },
            {
                "id": "student",
                "title": "Student Essay Draft",
                "badge": "Academic",
                "text": "The experyment showed signifikant diferences between the two grouops in the labratory."
            },
            {
                "id": "professional",
                "title": "Professional Email Typos",
                "badge": "Business",
                "text": "Please find attache the updated scheduel for our tomorow meetting with the client."
            },
            {
                "id": "typos",
                "title": "Common Transpositions & Typos",
                "badge": "Keyboard Typos",
                "text": "We recieved the mesage from the managr and will chek the speling immidiately."
            },
            {
                "id": "long_paragraph",
                "title": "Extended Paragraph",
                "badge": "Paragraph",
                "text": "Artifishal inteligence and natrual language procesing have made remarkable progres in recent years. Modren spelling corection tools utilize advansed algorithmic aproaches like SymSpell to achive sub-milisecond lookup speeds while preserving context."
            }
        ]
