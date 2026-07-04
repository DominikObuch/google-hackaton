import { Injectable } from '@nestjs/common';

@Injectable()
export class TopologyService {
  getTopologyData() {
    return {
      nodes: [
        {
          id: 'prompt',
          type: 'giggsNode',
          position: { x: 50, y: 160 },
          data: {
            label: 'User Prompt',
            icon: 'edit_note',
            description: 'Problem description input from the workbench.',
            status: 'idle',
            metric: 'IDLE',
          }
        },
        {
          id: 'triz',
          type: 'giggsNode',
          position: { x: 350, y: 160 },
          data: {
            label: 'TRIZ Engine',
            icon: 'psychology',
            description: 'Contradiction matrix lookup via PyTRIZ MCP server.',
            status: 'idle',
            metric: 'IDLE',
          }
        },
        {
          id: 'gemini',
          type: 'giggsNode',
          position: { x: 650, y: 160 },
          data: {
            label: 'Gemini LLM',
            icon: 'auto_awesome',
            description: 'Solution generation via Google AI Studio.',
            status: 'idle',
            metric: 'IDLE',
          }
        },
        {
          id: 'arena',
          type: 'giggsNode',
          position: { x: 950, y: 160 },
          data: {
            label: 'Arena Evaluator',
            icon: 'leaderboard',
            description: 'Candidate scoring & comparative analysis.',
            status: 'idle',
            metric: 'IDLE',
          }
        },
        {
          id: 'results',
          type: 'giggsNode',
          position: { x: 1250, y: 160 },
          data: {
            label: 'Results Dashboard',
            icon: 'dashboard',
            description: 'Final evaluation output & recommendations.',
            status: 'idle',
            metric: 'IDLE',
          }
        }
      ],
      edges: [
        {
          id: 'link-prompt-triz',
          type: 'custom',
          source: 'prompt',
          target: 'triz',
          sourcePort: 'port-right',
          targetPort: 'port-left',
          data: { status: 'default' }
        },
        {
          id: 'link-triz-gemini',
          type: 'custom',
          source: 'triz',
          target: 'gemini',
          sourcePort: 'port-right',
          targetPort: 'port-left',
          data: { status: 'default' }
        },
        {
          id: 'link-gemini-arena',
          type: 'custom',
          source: 'gemini',
          target: 'arena',
          sourcePort: 'port-right',
          targetPort: 'port-left',
          data: { status: 'default' }
        },
        {
          id: 'link-arena-results',
          type: 'custom',
          source: 'arena',
          target: 'results',
          sourcePort: 'port-right',
          targetPort: 'port-left',
          data: { status: 'default' }
        }
      ]
    };
  }
}
