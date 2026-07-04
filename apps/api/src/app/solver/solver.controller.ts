import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SolverService } from './solver.service';
import { 
  SolveProblemDto, 
  ReasoningTrail, 
  ExtractContradictionDto, 
  ContradictionDto,
  GenerateTrizDto,
  UnifiedCandidate,
  EvaluateCandidatesDto
} from './dto/solver.dto';

@ApiTags('solver')
@Controller('solver')
export class SolverController {
  constructor(private readonly solverService: SolverService) {}

  @Post('solve')
  @ApiOperation({ summary: 'Solve an inventive problem using TRIZ and LCA workflows (All-in-one)' })
  @ApiResponse({ status: 201, description: 'The complete reasoning trail with evaluation and final choice.' })
  async solveProblem(@Body() dto: SolveProblemDto): Promise<ReasoningTrail> {
    try {
      return await this.solverService.solve(dto);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }

  @Post('extract')
  @ApiOperation({ summary: 'Extract Technical Contradiction from problem' })
  async extractContradiction(@Body() dto: ExtractContradictionDto): Promise<ContradictionDto> {
    try {
      return await this.solverService.extractContradiction(dto.problem);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }

  @Post('triz')
  @ApiOperation({ summary: 'Generate TRIZ candidates based on problem and contradiction' })
  async generateTrizCandidates(@Body() dto: GenerateTrizDto): Promise<UnifiedCandidate[]> {
    try {
      return await this.solverService.generateTrizCandidates(dto.problem, dto.contradiction);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }

  @Post('lca')
  @ApiOperation({ summary: 'Generate LCA candidates with Deep Research' })
  async generateLcaCandidates(@Body() dto: ExtractContradictionDto): Promise<UnifiedCandidate[]> {
    try {
      return await this.solverService.generateLcaCandidates(dto.problem);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }

  @Post('5whys')
  @ApiOperation({ summary: 'Generate 5 Whys candidates with deductive analysis' })
  async generate5WhysCandidates(@Body() dto: ExtractContradictionDto): Promise<UnifiedCandidate[]> {
    try {
      return await this.solverService.generateFiveWhysCandidates(dto.problem);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate all candidates in the Arena' })
  async evaluateCandidates(@Body() dto: EvaluateCandidatesDto): Promise<{ evaluatedCandidates: UnifiedCandidate[], finalJustification: string }> {
    try {
      return await this.solverService.evaluateCandidates(dto.problem, dto.candidates);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }
}
