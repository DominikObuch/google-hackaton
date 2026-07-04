import { Module } from '@nestjs/common';
import { ArenaController } from './arena.controller';
import { ArenaService } from './arena.service';
import { TrizModule } from '../triz/triz.module';
import { GoogleModule } from '../google/google.module';

@Module({
  imports: [TrizModule, GoogleModule],
  controllers: [ArenaController],
  providers: [ArenaService],
})
export class ArenaModule {}
