// geminiService.ts
// This file exports the AIAnalysisResult type used across the app,
// and provides a direct backend call (no Gemini API needed).

export interface AIAnalysisResult {
  prediction: 'Tumor' | 'No Tumor';
  confidence: number;
  explanation: string;
  gradcam_url?: string;
  risk_level?: string;
  roi: { x: number; y: number; width: number; height: number } | null;
}

const API = 'http://localhost:8000';

/**
 * Calls the backend /api/predict/quick endpoint.
 * No authentication required — used by the Patient Portal.
 */
export const analyzeMRI = async (file: File): Promise<AIAnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_name', 'resnet50');

  const response = await fetch(`${API}/api/predict/quick`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).detail || `Server error ${response.status}`);
  }

  const data = await response.json();

  return {
    prediction: data.prediction as 'Tumor' | 'No Tumor',
    confidence: Math.round(data.confidence * 100),
    explanation: data.explanation ?? 'No explanation provided.',
    gradcam_url: data.gradcam_url ? `${API}${data.gradcam_url}` : undefined,
    risk_level: data.risk_level ?? undefined,
    roi: data.prediction === 'Tumor' ? { x: 30, y: 40, width: 20, height: 20 } : null,
  };
};