export interface CandidateItem {
  term: string;
  score: number;
  distance?: number;
  engine: string;
}

export interface CorrectionItem {
  id: number;
  original: string;
  is_mistake: boolean;
  textblob_correction: string;
  textblob_confidence: number;
  symspell_correction: string;
  symspell_confidence: number;
  symspell_distance: number;
  recommended: string;
  chosen_algorithm: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  start_char: number;
  end_char: number;
  textblob_candidates: CandidateItem[];
  symspell_candidates: CandidateItem[];
  explanation: string;
}

export interface CorrectionStatistics {
  total_words: number;
  total_characters: number;
  textblob_error_count: number;
  symspell_error_count: number;
  total_corrections_made: number;
  textblob_time_ms: number;
  symspell_time_ms: number;
  total_time_ms: number;
  speedup_ratio: number;
  agreement_percentage: number;
  words_corrected_percentage: number;
}

export interface PipelineStep {
  step_number: number;
  name: string;
  description: string;
  input_sample: string;
  output_sample: string;
}

export interface CorrectionResponse {
  original_text: string;
  textblob_result: string;
  symspell_result: string;
  recommended_result: string;
  corrections: CorrectionItem[];
  statistics: CorrectionStatistics;
  processing_time_ms: number;
  pipeline_trace: PipelineStep[];
  applied_algorithm: string;
}

export interface DecisionStep {
  step_name: string;
  value: string;
  description: string;
}

export interface SingleWordAnalysis {
  word: string;
  is_correct: boolean;
  selected_correction: string;
  edit_distance: number;
  candidate_generation: string[];
  decision_steps: DecisionStep[];
  edit_distance_explained: string;
  symspell_deletes: string[];
  symspell_candidates: Array<{
    term: string;
    distance: number;
    count: number;
    score: number;
  }>;
  textblob_candidates: Array<{
    term: string;
    score: number;
  }>;
  best_candidate: string;
  algorithm_comparison_note: string;
}

export interface PresetExample {
  id: string;
  title: string;
  badge: string;
  text: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  textblob_ready: boolean;
  symspell_ready: boolean;
  dictionary_terms_loaded: number;
}
