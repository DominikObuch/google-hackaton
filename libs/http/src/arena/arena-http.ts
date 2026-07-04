export interface EvaluationMetric {
  name: string;
  label: string;
}

export interface CandidateTag {
  label: string;
  theme: 'primary' | 'muted' | 'success' | 'warning' | 'error';
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  tags: CandidateTag[];
  isWinner?: boolean;
  scores: Record<string, number>;
}

export interface SystemCommentary {
  title: string;
  description: string;
}

export interface EvaluationArenaResponse {
  metrics: EvaluationMetric[];
  candidates: Candidate[];
  commentary: SystemCommentary;
}

export interface EvaluateProblemRequest {
  problemDescription: string;
  improvingParams: number[];
  preservingParams: number[];
}
