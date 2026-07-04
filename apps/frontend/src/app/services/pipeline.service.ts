import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SolverHttp, ReasoningTrail, ContradictionDto, UnifiedCandidate } from '@workspace/http';
import { firstValueFrom } from 'rxjs';

export type PipelineStage = 'idle' | 'prompt' | 'extracting' | 'generating_candidates' | 'evaluating' | 'done' | 'error';

export interface PipelineLogEntry {
  timestamp: string;
  stage: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface PipelineRequest {
  problemDescription: string;
}

@Injectable({ providedIn: 'root' })
export class PipelineService {
  private readonly router = inject(Router);
  private readonly solverHttp = inject(SolverHttp);

  /** Current pipeline stage */
  readonly stage = signal<PipelineStage>('idle');

  /** Log entries appended during execution */
  readonly logs = signal<PipelineLogEntry[]>([]);

  /** Intermediate State */
  readonly problem = signal<string>('');
  readonly contradiction = signal<ContradictionDto | null>(null);
  readonly trizCandidates = signal<UnifiedCandidate[]>([]);
  readonly lcaCandidates = signal<UnifiedCandidate[]>([]);
  readonly fiveWhysCandidates = signal<UnifiedCandidate[]>([]);
  
  /** Final reasoning trail */
  readonly reasoningTrail = signal<ReasoningTrail | null>(null);

  /** Whether pipeline is actively running */
  readonly isRunning = computed(() => {
    const s = this.stage();
    return s !== 'idle' && s !== 'done' && s !== 'error';
  });

  private addLog(stage: string, message: string, type: PipelineLogEntry['type'] = 'info') {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-GB', { hour12: false });
    this.logs.update(prev => [...prev, { timestamp, stage, message, type }]);
  }

  /** Kick off the full pipeline execution */
  async startPipeline(request: PipelineRequest): Promise<void> {
    // Reset state
    this.logs.set([]);
    this.problem.set(request.problemDescription);
    this.contradiction.set(null);
    this.trizCandidates.set([]);
    this.lcaCandidates.set([]);
    this.fiveWhysCandidates.set([]);
    this.reasoningTrail.set(null);

    try {
      // Stage 1: Prompt received
      this.stage.set('prompt');
      this.addLog('PROMPT', `Problem received: "${request.problemDescription.substring(0, 80)}..."`, 'info');
      await this.delay(600);

      // Stage 2: Extracting Contradiction
      this.stage.set('extracting');
      this.addLog('EXTRACT', `Extracting technical contradiction using Gemini...`, 'info');
      const contradiction = await firstValueFrom(this.solverHttp.extractContradiction(request.problemDescription));
      this.contradiction.set(contradiction);
      this.addLog('EXTRACT', `✓ Extracted: Improve [${contradiction.improvingFeature}] vs Worsen [${contradiction.worseningFeature}]`, 'success');
      await this.delay(800);

      // Stage 3: Generating Candidates (Concurrent TRIZ, LCA, and 5 Whys)
      this.stage.set('generating_candidates');
      this.addLog('GENERATE', `Starting parallel TRIZ matrix lookup, LCA Deep Research, and 5 Whys deduction...`, 'info');
      
      const [trizResult, lcaResult, fiveWhysResult] = await Promise.all([
        firstValueFrom(this.solverHttp.generateTrizCandidates(request.problemDescription, contradiction)),
        firstValueFrom(this.solverHttp.generateLcaCandidates(request.problemDescription)),
        firstValueFrom(this.solverHttp.generate5WhysCandidates(request.problemDescription))
      ]);
      
      this.trizCandidates.set(trizResult);
      this.lcaCandidates.set(lcaResult);
      this.fiveWhysCandidates.set(fiveWhysResult);
      this.addLog('GENERATE', `✓ Generated ${trizResult.length} TRIZ, ${lcaResult.length} LCA, and ${fiveWhysResult.length} 5-Whys candidates`, 'success');
      await this.delay(1000);

      // Stage 4: Evaluating Candidates in the Arena
      this.stage.set('evaluating');
      this.addLog('ARENA', `Evaluating all ${trizResult.length + lcaResult.length + fiveWhysResult.length} candidates in the automated arena...`, 'info');
      const allCandidates = [...trizResult, ...lcaResult, ...fiveWhysResult];
      
      const evalResult = await firstValueFrom(this.solverHttp.evaluateCandidates(request.problemDescription, allCandidates));
      
      const winner = evalResult.evaluatedCandidates.find(c => c.isWinner);
      if (winner) {
        this.addLog('ARENA', `✓ Winner Selected: ${winner.title} (Score: ${winner.overallScore}/10)`, 'success');
      }

      // Finalize reasoning trail
      this.reasoningTrail.set({
        originalProblem: request.problemDescription,
        contradiction,
        candidates: evalResult.evaluatedCandidates,
        finalJustification: evalResult.finalJustification
      });

      await this.delay(800);

      // Stage 5: Done
      this.stage.set('done');
      this.addLog('DONE', `Pipeline complete. Results ready for review.`, 'success');

      await this.delay(2500);
      this.router.navigate(['/arena']);
    } catch (err) {
      this.addLog('ERROR', `✗ Backend generation failed: ${err}`, 'error');
      this.stage.set('error');
    }
  }

  /** Reset pipeline to idle */
  reset() {
    this.stage.set('idle');
    this.logs.set([]);
    this.problem.set('');
    this.contradiction.set(null);
    this.trizCandidates.set([]);
    this.lcaCandidates.set([]);
    this.fiveWhysCandidates.set([]);
    this.reasoningTrail.set(null);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
