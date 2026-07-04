import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TrizService {
  private readonly logger = new Logger(TrizService.name);
  private readonly mcpUrl: string;
  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MCP_HOST') || 'localhost';
    const port = this.configService.get<string>('MCP_PORT') || '8123';
    this.mcpUrl = this.configService.get<string>('MCP_SERVER_URL') || `http://${host}:${port}/mcp`;
  }

  private async callMcpTool(name: string, args: Record<string, unknown>): Promise<string> {
    try {
      const response = await axios.post(
        this.mcpUrl,
        {
          jsonrpc: '2.0',
          id: Date.now().toString(),
          method: 'tools/call',
          params: {
            name,
            arguments: args,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.data?.error) {
        throw new Error(response.data.error.message || 'MCP Error');
      }

      // FastMCP tool response is under result.content[0].text
      const content = response.data?.result?.content;
      if (content && Array.isArray(content) && content.length > 0) {
        return content[0].text || '';
      }
      return '';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error calling MCP tool ${name}: ${message}`, stack);
      throw error;
    }
  }

  async browseContradictionMatrix(improvingParams: number[], preservingParams: number[]): Promise<string> {
    return this.callMcpTool('browse_contradiction_matrix', {
      improving_params: improvingParams,
      preserving_params: preservingParams,
    });
  }

  async searchParameter(query: string, limit = 5): Promise<string> {
    return this.callMcpTool('search_parameter', { query, limit });
  }

  async searchPrinciple(query: string, limit = 5): Promise<string> {
    return this.callMcpTool('search_principle', { query, limit });
  }

  async getRandomPrinciples(limit = 5): Promise<string> {
    return this.callMcpTool('get_random_principles', { limit });
  }

  async getPrincipleById(id: number): Promise<string> {
    return this.callMcpTool('get_principle_by_id', { principle_id: id });
  }

  async getParameterById(id: number): Promise<string> {
    return this.callMcpTool('get_parameter_by_id', { parameter_id: id });
  }

  async getEntireMatrix(): Promise<string> {
    return this.callMcpTool('get_entire_matrix', {});
  }
}

