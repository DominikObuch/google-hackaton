import { Module } from '@nestjs/common';
import { TrizController } from './triz.controller';
import { TrizService } from './triz.service';

@Module({
  controllers: [TrizController],
  providers: [TrizService],
  exports: [TrizService],
})
export class TrizModule {}
