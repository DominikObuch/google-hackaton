import { Injectable, Logger } from '@nestjs/common';
import { TrizService } from '../triz/triz.service';
import { GoogleService } from '../google/google.service';
import type { EvaluateProblemRequest, EvaluationArenaResponse, Candidate } from '../../../../../libs/http/src/arena/arena-http';

@Injectable()
export class ArenaService {
  private readonly logger = new Logger(ArenaService.name);

  constructor(
    private readonly trizService: TrizService,
    private readonly googleService: GoogleService
  ) {}

  async evaluateProblem(request: EvaluateProblemRequest): Promise<EvaluationArenaResponse> {
    this.logger.log(`Evaluating problem: ${request.problemDescription}`);
    
    // 1. Fetch principles from TRIZ Contradiction Matrix
    let principlesText = 'No specific principles found.';
    try {
      principlesText = await this.trizService.browseContradictionMatrix(
        request.improvingParams,
        request.preservingParams
      );
      this.logger.log('Successfully retrieved TRIZ principles.');
    } catch (error) {
      this.logger.warn(`Failed to fetch TRIZ principles: ${error}`);
    }

    // 2. Pass problem and principles to Gemini for solution generation
    let rawCandidates: any[] = [];
    try {
      rawCandidates = await this.googleService.generateTrizSolutions(
        request.problemDescription,
        principlesText
      );
      this.logger.log(`Successfully generated ${rawCandidates.length} solutions from Gemini.`);
    } catch (error) {
      this.logger.error(`Failed to generate solutions: ${error}`);
      throw new Error('Failed to generate evaluation solutions via LLM.');
    }

    // 3. Map raw JSON candidates to the structured UI DTO
    const candidates: Candidate[] = rawCandidates.map((c, index) => {
      const tags: { label: string; theme: 'primary' | 'muted' | 'success' | 'warning' | 'error' }[] = [];
      
      if (c.principles) {
        tags.push({ label: `Principles: ${c.principles}`, theme: 'primary' });
      }
      if (c.winner) {
        tags.push({ label: 'Winner', theme: 'success' });
      }

      return {
        id: String.fromCharCode(65 + index), // A, B, C
        name: c.title || `Candidate ${index + 1}`,
        description: c.description || '',
        tags,
        isWinner: !!c.winner,
        scores: {
          recovery: Number(c.recovery) || 0,
          scalability: Number(c.scalability) || 0,
          cost: Number(c.cost) || 0,
          safety: Number(c.safety) || 0,
          speed: Number(c.speed) || 0,
        }
      };
    });

    const winningCandidate = candidates.find(c => c.isWinner) || candidates[0];

    // 4. Return the fully orchestrated payload
    return {
      metrics: [
        { name: 'recovery', label: 'Recovery Rate' },
        { name: 'scalability', label: 'Scalability' },
        { name: 'cost', label: 'Cost Efficiency' },
        { name: 'safety', label: 'Safety Index' },
        { name: 'speed', label: 'Disassembly Speed' }
      ],
      candidates,
      commentary: {
        title: 'Recommendation Summary',
        description: winningCandidate 
          ? `Candidate **${winningCandidate.name}** was selected as the optimal solution due to its balance of metrics when applying the extracted TRIZ principles.`
          : 'Evaluation complete. Review the candidate scores above.'
      }
    };
  }
}
