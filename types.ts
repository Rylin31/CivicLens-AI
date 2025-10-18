export interface AnalysisResult {
  headline: string;
  summary: string;
  pros: string[];
  cons: string[];
  toneAnalysis: {
    tone: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    reason: string;
  };
  keyStakeholders: string[];
  citizenImpactSummary: string;
}
