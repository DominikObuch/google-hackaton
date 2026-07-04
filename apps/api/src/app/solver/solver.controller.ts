import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SolverService } from './solver.service';
import { SolveProblemDto, ReasoningTrail } from './dto/solver.dto';

@ApiTags('solver')
@Controller('solver')
export class SolverController {
  constructor(private readonly solverService: SolverService) {}

  @Post('solve')
  @ApiOperation({ summary: 'Solve an inventive problem using TRIZ and LCA workflows' })
  @ApiResponse({ status: 201, description: 'The complete reasoning trail with evaluation and final choice.' })
  async solveProblem(@Body() dto: SolveProblemDto): Promise<ReasoningTrail> {
    try {
      return await this.solverService.solve(dto);
    } catch (error) {
      const msg = error instanceof Error ? error.stack : String(error);
      throw new HttpException(msg, 500);
    }
  }
}
