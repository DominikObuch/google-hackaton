import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SolveProblemDto {
  @ApiProperty({ description: 'The original inventive problem to solve', example: 'We need to make the car frame stronger to survive crashes, but that makes it too heavy and reduces fuel efficiency.' })
  @IsString()
  @IsNotEmpty()
  problem: string;
}

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
  reasoning: string; // Evaluation reasoning for this specific candidate
  isWinner: boolean; // Replaces finalChoice
  
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
