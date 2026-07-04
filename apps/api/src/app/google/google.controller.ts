import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GoogleService } from './google.service';

export class TestConnectionDto {
  @ApiProperty({
    description: 'Optional custom API key to test. If not provided, the server uses the configured environment key.',
    required: false,
  })
  @IsString()
  @IsOptional()
  apiKey?: string;
}

export class ConnectionStatusResponse {
  @ApiProperty({ description: 'Indicates whether the connection check was successful.' })
  success: boolean;

  @ApiProperty({ description: 'Indicates whether an API key was found/configured.' })
  configured: boolean;

  @ApiProperty({ description: 'The Gemini model used for the verification check.', required: false })
  model?: string;

  @ApiProperty({ description: 'The verification response message from Gemini.', required: false })
  message?: string;

  @ApiProperty({ description: 'Error message if the connection verification failed.', required: false })
  error?: string;
}

export class GenerateSolutionsDto {
  @ApiProperty({ description: 'The problem description to solve.' })
  @IsString()
  problemDescription: string;

  @ApiProperty({ description: 'The text containing the extracted TRIZ principles.' })
  @IsString()
  principlesText: string;
}

@ApiTags('google')
@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check status of the configured Google Gemini API key' })
  @ApiResponse({ status: HttpStatus.OK, type: ConnectionStatusResponse })
  async getStatus(): Promise<ConnectionStatusResponse> {
    return this.googleService.checkConnection();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test connection with an optional custom Google Gemini API key' })
  @ApiResponse({ status: HttpStatus.OK, type: ConnectionStatusResponse })
  async testConnection(@Body() body: TestConnectionDto): Promise<ConnectionStatusResponse> {
    return this.googleService.checkConnection(body.apiKey);
  }

  @Post('generate-solutions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate TRIZ solutions using Gemini' })
  async generateSolutions(@Body() body: GenerateSolutionsDto): Promise<any[]> {
    return this.googleService.generateTrizSolutions(body.problemDescription, body.principlesText);
  }
}
