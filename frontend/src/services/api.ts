import {
  CorrectionResponse,
  SingleWordAnalysis,
  PresetExample,
  HealthStatus
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function correctText(
  text: string,
  algorithm: 'compare' | 'textblob' | 'symspell' = 'compare'
): Promise<CorrectionResponse> {
  const endpoint = `${API_BASE_URL}/correct`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      algorithm,
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Correction failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `Server responded with code ${response.status}`;
    }
    throw new ApiError(response.status, errorDetail);
  }

  return response.json();
}

export async function analyzeWord(word: string, maxEditDistance = 2): Promise<SingleWordAnalysis> {
  const response = await fetch(`${API_BASE_URL}/analyze-word`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      word,
      max_edit_distance: maxEditDistance,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errJson.detail || 'Word analysis failed');
  }

  return response.json();
}

export async function fetchExamples(): Promise<PresetExample[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/examples`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Failed to fetch examples from backend, using local defaults', e);
  }

  // Fallback defaults
  return [
    {
      id: 'basic',
      title: 'Basic Everyday Mistakes',
      badge: 'Everyday',
      text: 'I hav a beutiful day and I am goin to the markat.'
    },
    {
      id: 'student',
      title: 'Student Essay Draft',
      badge: 'Academic',
      text: 'The experyment showed signifikant diferences between the two grouops in the labratory.'
    },
    {
      id: 'professional',
      title: 'Professional Email Typos',
      badge: 'Business',
      text: 'Please find attache the updated scheduel for our tomorow meetting with the client.'
    },
    {
      id: 'typos',
      title: 'Common Transpositions & Typos',
      badge: 'Keyboard Typos',
      text: 'We recieved the mesage from the managr and will chek the speling immidiately.'
    },
    {
      id: 'long_paragraph',
      title: 'Extended Paragraph',
      badge: 'Paragraph',
      text: 'Artifishal inteligence and natrual language procesing have made remarkable progres in recent years. Modren spelling corection tools utilize advansed algorithmic aproaches like SymSpell to achive sub-milisecond lookup speeds while preserving context.'
    }
  ];
}

export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new ApiError(response.status, 'Backend service unreachable');
  }
  return response.json();
}
