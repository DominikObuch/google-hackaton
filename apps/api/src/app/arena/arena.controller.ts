import { Controller, Post, Body } from '@nestjs/common';
import { ArenaService } from './arena.service';
import type { EvaluationArenaResponse, EvaluateProblemRequest } from '../../../../../libs/http/src/arena/arena-http';

@Controller('arena')
export class ArenaController {
  constructor(private readonly arenaService: ArenaService) {}

  @Post('evaluate')
  async evaluateProblem(@Body() body: EvaluateProblemRequest): Promise<EvaluationArenaResponse> {
    return this.arenaService.evaluateProblem(body);
  }
}
