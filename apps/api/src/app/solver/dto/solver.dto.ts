import { IsString, IsNotEmpty, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SolveProblemDto {
  @ApiProperty({ description: 'The original inventive problem to solve', example: 'We need to make the car frame stronger to survive crashes, but that makes it too heavy and reduces fuel efficiency.' })
  @IsString()
  @IsNotEmpty()
  problem: string;
}

export class ContradictionDto {
  action: string;
  improvingFeature: string;
  worseningFeature: string;
  improvingParameterId?: number;
  worseningParameterId?: number;
}

export class ExtractContradictionDto {
  @IsString()
  @IsNotEmpty()
  problem: string;
}

export class GenerateTrizDto {
  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsObject()
  contradiction: ContradictionDto;
}

export class EvaluateCandidatesDto {
  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsArray()
  candidates: UnifiedCandidate[];
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
  contradiction: ContradictionDto;
  candidates: UnifiedCandidate[];
  finalJustification: string;
}
