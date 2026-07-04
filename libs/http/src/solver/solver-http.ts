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

  feasibilityScore: number;
  sustainabilityScore: number;
  costScore: number;
  impactScore: number;
  overallScore: number;
  reasoning: string; 
  isWinner: boolean; 
  
  scientificPapers?: ScientificPaper[]; 
}

export interface ContradictionDto {
  action: string;
  improvingFeature: string;
  worseningFeature: string;
  improvingParameterId?: number;
  worseningParameterId?: number;
}

export interface ReasoningTrail {
  originalProblem: string;
  contradiction: ContradictionDto;
  candidates: UnifiedCandidate[];
  finalJustification: string;
}

@Injectable({ providedIn: 'root' })
export class SolverHttp {
  private readonly http = inject(HttpClient);

  solve(problem: string): Observable<ReasoningTrail> {
    return this.http.post<ReasoningTrail>('/api/solver/solve', { problem });
  }

  extractContradiction(problem: string): Observable<ContradictionDto> {
    return this.http.post<ContradictionDto>('/api/solver/extract', { problem });
  }

  generateTrizCandidates(problem: string, contradiction: ContradictionDto): Observable<UnifiedCandidate[]> {
    return this.http.post<UnifiedCandidate[]>('/api/solver/triz', { problem, contradiction });
  }

  generateLcaCandidates(problem: string): Observable<UnifiedCandidate[]> {
    return this.http.post<UnifiedCandidate[]>('/api/solver/lca', { problem });
  }

  generate5WhysCandidates(problem: string): Observable<UnifiedCandidate[]> {
    return this.http.post<UnifiedCandidate[]>('/api/solver/5whys', { problem });
  }

  evaluateCandidates(problem: string, candidates: UnifiedCandidate[]): Observable<{ evaluatedCandidates: UnifiedCandidate[], finalJustification: string }> {
    return this.http.post<{ evaluatedCandidates: UnifiedCandidate[], finalJustification: string }>('/api/solver/evaluate', { problem, candidates });
  }
}
