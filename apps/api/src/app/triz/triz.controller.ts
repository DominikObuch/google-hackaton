import { Controller, Get, Param, Query, ParseIntPipe, ParseArrayPipe } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrizService } from './triz.service';

@ApiTags('triz')
@Controller('triz')
export class TrizController {
  constructor(private readonly trizService: TrizService) {}

  @Get('matrix')
  @ApiOperation({ summary: 'Browse contradiction matrix cells' })
  @ApiQuery({ name: 'improving', type: String, description: 'Comma-separated parameter IDs to improve' })
  @ApiQuery({ name: 'preserving', type: String, description: 'Comma-separated parameter IDs to preserve' })
  async browseMatrix(
    @Query('improving', new ParseArrayPipe({ items: Number, separator: ',' })) improving: number[],
    @Query('preserving', new ParseArrayPipe({ items: Number, separator: ',' })) preserving: number[],
  ): Promise<{ result: string }> {
    const result = await this.trizService.browseContradictionMatrix(improving, preserving);
    return { result };
  }

  @Get('parameters/search')
  @ApiOperation({ summary: 'Search engineering parameters semantically' })
  async searchParameters(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ): Promise<{ result: string }> {
    const result = await this.trizService.searchParameter(query, limit ? Number(limit) : 5);
    return { result };
  }

  @Get('principles/search')
  @ApiOperation({ summary: 'Search inventive principles semantically' })
  async searchPrinciples(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ): Promise<{ result: string }> {
    const result = await this.trizService.searchPrinciple(query, limit ? Number(limit) : 5);
    return { result };
  }

  @Get('principles/random')
  @ApiOperation({ summary: 'Get random selection of inventive principles' })
  async getRandom(
    @Query('limit') limit?: number,
  ): Promise<{ result: string }> {
    const result = await this.trizService.getRandomPrinciples(limit ? Number(limit) : 5);
    return { result };
  }

  @Get('matrix/all')
  @ApiOperation({ summary: 'Get entire 39x39 contradiction matrix' })
  async getEntireMatrix(): Promise<{ result: string }> {
    const result = await this.trizService.getEntireMatrix();
    return { result };
  }

  @Get('parameters/:id')
  @ApiOperation({ summary: 'Get details of an engineering parameter by ID' })
  async getParameter(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ result: string }> {
    const result = await this.trizService.getParameterById(id);
    return { result };
  }

  @Get('principles/:id')
  @ApiOperation({ summary: 'Get details of an inventive principle by ID' })
  async getPrinciple(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ result: string }> {
    const result = await this.trizService.getPrincipleById(id);
    return { result };
  }
}
