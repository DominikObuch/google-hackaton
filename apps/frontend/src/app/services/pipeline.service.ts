import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SolverHttp, ReasoningTrail } from '@workspace/http';
import { firstValueFrom } from 'rxjs';

export type PipelineStage = 'idle' | 'prompt' | 'solving' | 'done' | 'error';

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

  /** The latest reasoning trail from the backend */
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
    this.reasoningTrail.set(null);

    // Stage 1: Prompt received
    this.stage.set('prompt');
    this.addLog('PROMPT', `Problem received: "${request.problemDescription.substring(0, 80)}..."`, 'info');

    await this.delay(600);

    // Stage 2: Solving (Backend Orchestration)
    this.stage.set('solving');
    this.addLog('SOLVER', `Orchestrating AI pipeline (TRIZ, LCA Deep Research, Arena Evaluation)...`, 'info');
    this.addLog('SOLVER', `This process takes ~30-60 seconds...`, 'info');

    try {
      const trail = await firstValueFrom(
        this.solverHttp.solve(request.problemDescription)
      );
      this.reasoningTrail.set(trail);
      this.addLog('SOLVER', `✓ Successfully extracted contradiction & evaluated candidates!`, 'success');
      
      const winner = trail.candidates.find(c => c.isWinner);
      if (winner) {
        this.addLog('ARENA', `✓ Winner: ${winner.title} (Score: ${winner.overallScore}/10)`, 'success');
      }
    } catch (err) {
      this.addLog('SOLVER', `✗ Backend generation failed: ${err}`, 'error');
      this.stage.set('error');
      return;
    }

    await this.delay(800);

    // Stage 3: Done
    this.stage.set('done');
    this.addLog('DONE', `Pipeline complete. Results ready for review.`, 'success');

    await this.delay(1500);
    this.router.navigate(['/arena']);
  }

  /** Reset pipeline to idle */
  reset() {
    this.stage.set('idle');
    this.logs.set([]);
    this.reasoningTrail.set(null);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
