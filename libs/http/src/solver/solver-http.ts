import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScientificPaper {
  title: string;
  url: string;
  summary: string;
}

export interface UnifiedCandidate {
  id: string; // e.g. TRIZ-1, LCA-1, 5WHYS-1
  source: 'TRIZ' | 'LCA' | 'FIVE_WHYS' | 'COMBINED';
  title: string;
  description: string;
  principles?: string; // e.g. "Segmentation (1), Changing the Color (32)"
  rootCause?: string; // 5 Whys: the root cause the candidate addresses

  // Flattened Scores
  feasibilityScore: number;
  sustainabilityScore: number;
  costScore: number;
  impactScore: number;
  
  overallScore: number;
  reasoning: string; 
  isWinner: boolean; 
  
  // Deep Research
  scientificPapers?: ScientificPaper[]; 
}

export interface ReasoningTrail {
  originalProblem: string;
  contradiction: {
    action: string;
    improvingFeature: string;
    worseningFeature: string;
    improvingParameterId?: number;
    worseningParameterId?: number;
  };
  candidates: UnifiedCandidate[];
  finalJustification: string;
}

export interface SolveProblemDto {
  problem: string;
}

@Injectable({ providedIn: 'root' })
export class SolverHttp {
  private readonly http = inject(HttpClient);

  solve(problem: string): Observable<ReasoningTrail> {
    return this.http.post<ReasoningTrail>('/api/solver/solve', { problem });
  }
}
