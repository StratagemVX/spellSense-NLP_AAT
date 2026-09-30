from typing import List, Dict, Any
from app.models.schemas import (
    CorrectionItem,
    CorrectionStatistics,
    PipelineStep,
    CandidateItem
)
from app.utils.text_utils import match_casing

def compare_corrections(
    text: str,
    tb_text: str,
    tb_corrections: List[Dict[str, Any]],
    tb_time_ms: float,
    ss_text: str,
    ss_corrections: List[Dict[str, Any]],
    ss_time_ms: float
) -> Dict[str, Any]:
    """
    Blends and compares TextBlob and SymSpell results at token and sentence levels.
    Employs candidate intersection and confidence weighting to resolve disagreements.
    """
    total_tokens = len(ss_corrections)
    total_words = total_tokens
    total_chars = len(text)

    unified_corrections: List[CorrectionItem] = []
    
    agreed_count = 0
    tb_error_count = 0
    ss_error_count = 0
    total_changed = 0

    for i in range(total_tokens):
        ss_item = ss_corrections[i]
        tb_item = tb_corrections[i] if i < len(tb_corrections) else ss_item

        orig = ss_item["original"]
        ss_corr = ss_item["corrected"]
        tb_corr = tb_item["corrected"]

        ss_changed = ss_item["is_changed"]
        tb_changed = tb_item["is_changed"]

        if ss_changed:
            ss_error_count += 1
        if tb_changed:
            tb_error_count += 1

        is_mistake = ss_changed or tb_changed
        if is_mistake:
            total_changed += 1

        # Check agreement
        if ss_corr.lower() == tb_corr.lower():
            agreed_count += 1

        dist = ss_item.get("distance", 0)
        ss_cands = ss_item.get("candidates", [])
        tb_cands = tb_item.get("candidates", [])

        ss_cand_terms = [c["term"].lower() for c in ss_cands]
        tb_cand_terms = [c["term"].lower() for c in tb_cands]

        chosen_algo = "SymSpell"
        recommended = ss_corr
        conf_score = ss_item["confidence"]
        explanation = ""

        if not is_mistake:
            chosen_algo = "Dictionary Verified"
            recommended = orig
            conf_score = 1.0
            explanation = "Word verified in vocabulary with 0 edit distance."
        elif ss_changed and tb_changed and ss_corr.lower() == tb_corr.lower():
            chosen_algo = "Both (Consensus)"
            conf_score = max(ss_item["confidence"], tb_item["confidence"])
            explanation = f"Consensus between TextBlob and SymSpell at edit distance {dist}."
        elif ss_changed and tb_changed and ss_corr.lower() != tb_corr.lower():
            # Disagreement between top 1 choices: inspect candidate cross-intersection
            # 1. Does SymSpell's #1 term appear in TextBlob's top candidates? (e.g. 'hav' -> 'have')
            if ss_corr.lower() in tb_cand_terms:
                chosen_algo = "SymSpell"
                recommended = ss_corr
                conf_score = max(0.88, ss_item["confidence"])
                explanation = f"SymSpell's top candidate '{ss_corr}' (edit dist {dist}) is confirmed by TextBlob candidate pool."
            # 2. Does TextBlob's #1 term appear in SymSpell's top candidates? (e.g. 'goin' -> 'going')
            elif tb_corr.lower() in ss_cand_terms:
                chosen_algo = "Combined (Intersection)"
                recommended = match_casing(orig, tb_corr)
                # find SymSpell distance for that candidate
                matched_cand = next((c for c in ss_cands if c["term"].lower() == tb_corr.lower()), None)
                cand_dist = matched_cand["distance"] if matched_cand else dist
                dist = cand_dist
                conf_score = 0.90
                explanation = f"Mutual candidate '{tb_corr}' identified across both TextBlob and SymSpell (edit dist {cand_dist})."
            # 3. Neither appears in the other's pool: choose based on edit distance and frequency
            elif dist <= 1 and ss_item["confidence"] >= tb_item["confidence"]:
                chosen_algo = "SymSpell"
                recommended = ss_corr
                conf_score = ss_item["confidence"]
                explanation = f"SymSpell preferred due to minimal edit distance ({dist}) and high vocabulary frequency."
            else:
                chosen_algo = "TextBlob" if tb_item["confidence"] > ss_item["confidence"] else "SymSpell"
                recommended = tb_corr if chosen_algo == "TextBlob" else ss_corr
                conf_score = max(ss_item["confidence"], tb_item["confidence"])
                explanation = f"Disagreement resolved in favor of {chosen_algo} probability score."
        elif ss_changed and not tb_changed:
            chosen_algo = "SymSpell"
            recommended = ss_corr
            conf_score = ss_item["confidence"]
            explanation = f"SymSpell detected spelling anomaly at edit distance {dist}."
        elif tb_changed and not ss_changed:
            chosen_algo = "TextBlob"
            recommended = tb_corr
            conf_score = tb_item["confidence"]
            explanation = "TextBlob identified candidate based on language model frequency."

        # Qualitative confidence classification
        if conf_score >= 0.85:
            conf_level = "High"
        elif conf_score >= 0.60:
            conf_level = "Medium"
        else:
            conf_level = "Low"

        # Transform candidate objects for schema
        tb_cand_items = [
            CandidateItem(term=c["term"], score=c["score"], engine="TextBlob")
            for c in tb_cands
        ]
        ss_cand_items = [
            CandidateItem(term=c["term"], score=c["score"], distance=c.get("distance"), engine="SymSpell")
            for c in ss_cands
        ]

        unified_corrections.append(
            CorrectionItem(
                id=i + 1,
                original=orig,
                is_mistake=is_mistake,
                textblob_correction=tb_corr,
                textblob_confidence=tb_item["confidence"],
                symspell_correction=ss_corr,
                symspell_confidence=ss_item["confidence"],
                symspell_distance=dist,
                recommended=recommended,
                chosen_algorithm=chosen_algo,
                confidence_level=conf_level,
                start_char=ss_item["start"],
                end_char=ss_item["end"],
                textblob_candidates=tb_cand_items,
                symspell_candidates=ss_cand_items,
                explanation=explanation
            )
        )

    rec_text = build_text_from_items(text, unified_corrections)

    agreement_pct = round((agreed_count / max(total_tokens, 1)) * 100.0, 1)
    corrected_rate = round((total_changed / max(total_tokens, 1)) * 100.0, 1)
    speedup = round(tb_time_ms / max(ss_time_ms, 0.001), 1) if ss_time_ms > 0 else 1.0

    stats = CorrectionStatistics(
        total_words=total_words,
        total_characters=total_chars,
        textblob_error_count=tb_error_count,
        symspell_error_count=ss_error_count,
        total_corrections_made=total_changed,
        textblob_time_ms=tb_time_ms,
        symspell_time_ms=ss_time_ms,
        total_time_ms=round(tb_time_ms + ss_time_ms, 3),
        speedup_ratio=speedup,
        agreement_percentage=agreement_pct,
        words_corrected_percentage=corrected_rate
    )

    pipeline_trace = [
        PipelineStep(
            step_number=1,
            name="Lexical Tokenization",
            description="Splits input string into words, preserving spaces and punctuation offsets.",
            input_sample=text[:40] + ("..." if len(text) > 40 else ""),
            output_sample=f"{total_words} tokens extracted"
        ),
        PipelineStep(
            step_number=2,
            name="Error Detection & Vocabulary Check",
            description="Checks each token against English frequency lexicon and Norvig spell-check model.",
            input_sample=f"Analyzed {total_words} word tokens",
            output_sample=f"Identified {total_changed} candidate spelling anomalies"
        ),
        PipelineStep(
            step_number=3,
            name="Candidate Generation",
            description="TextBlob generates edit 1/2 variations; SymSpell uses pre-indexed Symmetric Deletes.",
            input_sample="Query tokens needing correction",
            output_sample=f"Generated candidates across max edit distance 2"
        ),
        PipelineStep(
            step_number=4,
            name="Heuristic & Probability Ranking",
            description="Ranks candidates by Damerau-Levenshtein edit distance and unigram/bigram frequency.",
            input_sample="Candidate lists per token",
            output_sample=f"Best candidates selected with {agreement_pct}% consensus"
        ),
        PipelineStep(
            step_number=5,
            name="Orthographic Reconstruction",
            description="Reconstructs final sentence while matching original title/upper/lowercase casing.",
            input_sample="Selected candidate terms",
            output_sample=rec_text[:40] + ("..." if len(rec_text) > 40 else "")
        )
    ]

    return {
        "corrections": unified_corrections,
        "recommended_text": rec_text,
        "statistics": stats,
        "pipeline_trace": pipeline_trace
    }

def build_text_from_items(original_text: str, items: List[CorrectionItem]) -> str:
    if not items:
        return original_text

    result_chars = []
    last_idx = 0
    for item in items:
        if item.start_char > last_idx:
            result_chars.append(original_text[last_idx:item.start_char])
        result_chars.append(item.recommended)
        last_idx = item.end_char

    if last_idx < len(original_text):
        result_chars.append(original_text[last_idx:])

    return "".join(result_chars)
