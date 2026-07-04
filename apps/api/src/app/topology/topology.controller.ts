import { Controller, Get } from '@nestjs/common';
import { TopologyService } from './topology.service';

@Controller('topology')
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  @Get()
  getTopology() {
    return this.topologyService.getTopologyData();
  }
}
