import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrizService } from '../triz/triz.service';
import { SolveProblemDto, ReasoningTrail, UnifiedCandidate, ContradictionDto } from './dto/solver.dto';
import { GoogleGenAI, Type, Schema } from '@google/genai';

@Injectable()
export class SolverService {
  private readonly logger = new Logger(SolverService.name);
  private ai: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly trizService: TrizService
  ) {
    const apiKey = this.configService.get<string>('AI_STUDIO_API_KEY') || process.env.AI_STUDIO_API_KEY;
    if (!apiKey) {
      this.logger.warn('AI_STUDIO_API_KEY is not defined. Google GenAI calls will fail.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async generateContentWithRetry(request: any): Promise<any> {
    const maxRetries = 4;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.ai.models.generateContent(request);
      } catch (error: any) {
        const errorStr = String(error);
        if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('fetch failed')) {
          const waitTime = (i + 1) * 8000;
          this.logger.warn(`API error (${errorStr.includes('fetch failed') ? 'Network' : 'Rate Limit'}). Retrying in ${waitTime/1000}s... (Attempt ${i + 1}/${maxRetries})`);
          await this.delay(waitTime);
        } else {
          this.logger.error('Unhandled GenAI error:', error);
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded for Gemini API (Network/Rate Limit)');
  }

  async solve(dto: SolveProblemDto): Promise<ReasoningTrail> {
    this.logger.log(`Starting solving process for: ${dto.problem}`);
    const contradiction = await this.extractContradiction(dto.problem);
    const trizCandidates = await this.generateTrizCandidates(dto.problem, contradiction);
    const lcaCandidates = await this.generateLcaCandidates(dto.problem);
    // Step 4: Generate 5 Whys candidates (pure deductive root-cause analysis, no external knowledge base)
    const fiveWhysCandidates = await this.generateFiveWhysCandidates(dto.problem);

    // Step 5: Evaluate all candidates and create Unified model
    const allCandidates = [...trizCandidates, ...lcaCandidates, ...fiveWhysCandidates];
    const { evaluatedCandidates, finalJustification } = await this.evaluateCandidates(dto.problem, allCandidates);

    return {
      originalProblem: dto.problem,
      contradiction,
      candidates: evaluatedCandidates,
      finalJustification,
    };
  }

  async extractContradiction(problem: string): Promise<ContradictionDto> {
    this.logger.log('Step 1: Extracting technical contradiction...');

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "The action being taken or proposed." },
        improvingFeature: { type: Type.STRING, description: "The feature or parameter that improves as a result." },
        worseningFeature: { type: Type.STRING, description: "The feature or parameter that gets worse as a trade-off." },
      },
      required: ["action", "improvingFeature", "worseningFeature"],
    };

    const response = await this.generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: `You are an expert TRIZ engineer. Extract the technical contradiction from this problem: "${problem}". Return ONLY a JSON object with 'action', 'improvingFeature', and 'worseningFeature'.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async generateTrizCandidates(problem: string, contradiction: any) {
    this.logger.log('Step 2: Generating TRIZ candidates...');

    const improvingParamsRes = await this.trizService.searchParameter(contradiction.improvingFeature, 1);
    const worseningParamsRes = await this.trizService.searchParameter(contradiction.worseningFeature, 1);

    const extractId = async (mcpOutput: string) => {
      const res = await this.generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: `Extract the integer ID of the best matching TRIZ parameter from this MCP output: \n${mcpOutput}\nReturn ONLY the integer number.`,
      });
      return parseInt(res.text?.trim() || '0', 10);
    };

    const impId = await extractId(improvingParamsRes);
    const worId = await extractId(worseningParamsRes);

    contradiction.improvingParameterId = impId;
    contradiction.worseningParameterId = worId;

    let principlesText = '';
    if (impId > 0 && worId > 0 && impId !== worId) {
      principlesText = await this.trizService.browseContradictionMatrix([impId], [worId]);
    } else {
      principlesText = await this.trizService.searchPrinciple(problem, 3);
    }

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          principles: { type: Type.STRING, description: "E.g. 'Segmentation (1)'" }
        },
        required: ["title", "description", "principles"]
      }
    };

    const response = await this.generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: `You are a TRIZ inventor. Based on the original problem: "${problem}" and the following Inventive Principles found via the contradiction matrix: \n${principlesText}\nGenerate exactly 3 distinct candidate solutions. Each solution must explicitly use one of the provided principles.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });

    const candidates = JSON.parse(response.text || '[]');
    return candidates.map((c: any, index: number) => ({
      id: `TRIZ-${index + 1}`,
      source: 'TRIZ',
      title: c.title,
      description: c.description,
      principles: c.principles,
      scientificPapers: [] // TRIZ usually doesn't have specific deep research papers in this step
    }));
  }

  async generateLcaCandidates(problem: string) {
    this.logger.log('Step 3: Generating LCA candidates via DeepSearch...');

    const response = await this.generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: `You are a Sustainable Engineering expert. Research sustainable materials, Life Cycle Assessment (LCA) methodologies, and circular economy patterns applicable to this problem: "${problem}". Then, generate exactly 3 distinct candidate solutions based purely on LCA/Sustainability principles (e.g. material substitution, recycling, energy reduction). 
      IMPORTANT: You MUST return ONLY a raw JSON array. Do not include markdown formatting like \`\`\`json. 
      The JSON array must contain objects with 'title', 'description', and 'scientificPapers'. 
      'scientificPapers' MUST be an array of objects with 'title', 'url', and 'summary' representing real research papers, industry articles, or case studies that support the solution.`,
      config: {}
    });

    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const candidates = JSON.parse(text);
    return candidates.map((c: any, index: number) => ({
      id: `LCA-${index + 1}`,
      source: 'LCA',
      title: c.title,
      description: c.description,
      scientificPapers: c.scientificPapers || []
    }));
  }



  async generateFiveWhysCandidates(problem: string) {
    this.logger.log('Step 4: Generating 5 Whys candidates (deductive root-cause analysis)...');

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        whyChain: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 5 answers, one per successive 'Why?' question, drilling deeper into causation."
        },
        rootCause: { type: Type.STRING, description: "The single root cause reached after the 5 Whys." },
        candidates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          },
          description: "Exactly 3 solutions addressing the root cause directly."
        }
      },
      required: ["whyChain", "rootCause", "candidates"]
    };

    const response = await this.generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: `You are running the "5 Whys" root-cause-analysis method. Do NOT use any external knowledge base, contradiction matrix, or fixed list of principles - reason purely by sequential deduction, independently of TRIZ and LCA.

Problem: "${problem}"

Ask "Why does this happen?" and answer it, then ask "Why?" about that answer, repeating until you have asked "Why?" exactly 5 times (each answer one level deeper). State the resulting root cause, then propose exactly 3 solution ideas that address the ROOT CAUSE directly, not the surface symptoms.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const rootCause: string = parsed.rootCause || '';
    const candidates = parsed.candidates || [];
    return candidates.slice(0, 3).map((c: any, index: number) => ({
      id: `5WHYS-${index + 1}`,
      source: 'FIVE_WHYS',
      title: c.title,
      description: c.description,
      rootCause,
      scientificPapers: []
    }));
  }

  async evaluateCandidates(problem: string, candidates: any[]) {
    this.logger.log('Step 5: Evaluating all candidates into Unified model...');

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        evaluatedCandidates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              feasibilityScore: { type: Type.INTEGER, description: "1-10" },
              sustainabilityScore: { type: Type.INTEGER, description: "1-10" },
              costScore: { type: Type.INTEGER, description: "1-10" },
              impactScore: { type: Type.INTEGER, description: "1-10" },
              overallScore: { type: Type.INTEGER, description: "1-10" },
              reasoning: { type: Type.STRING },
              isWinner: { type: Type.BOOLEAN }
            },
            required: ["id", "feasibilityScore", "sustainabilityScore", "costScore", "impactScore", "overallScore", "reasoning", "isWinner"]
          }
        },
        finalJustification: { type: Type.STRING }
      },
      required: ["evaluatedCandidates", "finalJustification"]
    };

    const response = await this.generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: `You are the Chief R&D Engineer evaluating candidate solutions for the problem: "${problem}". \nHere are the candidates: \n${JSON.stringify(candidates, null, 2)}\nEvaluate all candidates against the original problem. Score them 1-10 on feasibility, sustainability, cost, and impact. Provide a reasoning for each. Select EXACTLY ONE winner (isWinner: true). Provide a finalJustification for the winner.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    const unifiedCandidates: UnifiedCandidate[] = candidates.map(c => {
      const evalData = parsed.evaluatedCandidates?.find((e: any) => e.id === c.id);
      return {
        ...c,
        feasibilityScore: evalData?.feasibilityScore || 0,
        sustainabilityScore: evalData?.sustainabilityScore || 0,
        costScore: evalData?.costScore || 0,
        impactScore: evalData?.impactScore || 0,
        overallScore: evalData?.overallScore || 0,
        reasoning: evalData?.reasoning || '',
        isWinner: evalData?.isWinner || false,
      } as UnifiedCandidate;
    });

    return {
      evaluatedCandidates: unifiedCandidates,
      finalJustification: parsed.finalJustification || ''
    };
  }
}
