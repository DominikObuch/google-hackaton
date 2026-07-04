import { Module } from '@nestjs/common';
import { SolverService } from './solver.service';
import { SolverController } from './solver.controller';
import { TrizModule } from '../triz/triz.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TrizModule],
  controllers: [SolverController],
  providers: [SolverService],
})
export class SolverModule {}
