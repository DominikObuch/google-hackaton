import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TrizHttp, GoogleHttp } from '@workspace/http';
import { firstValueFrom } from 'rxjs';

export type PipelineStage = 'idle' | 'prompt' | 'triz' | 'gemini' | 'arena' | 'done' | 'error';

export interface PipelineLogEntry {
  timestamp: string;
  stage: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface PipelineRequest {
  problemDescription: string;
  improvingParam: number;
  preservingParam: number;
}

@Injectable({ providedIn: 'root' })
export class PipelineService {
  private readonly router = inject(Router);
  private readonly trizHttp = inject(TrizHttp);
  private readonly googleHttp = inject(GoogleHttp);

  /** Current pipeline stage */
  readonly stage = signal<PipelineStage>('idle');

  /** Log entries appended during execution */
  readonly logs = signal<PipelineLogEntry[]>([]);

  /** The latest results from Gemini */
  readonly candidates = signal<any[]>([]);

  /** The extracted TRIZ principles text */
  readonly principlesText = signal<string>('');

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
    this.candidates.set([]);
    this.principlesText.set('');

    // Stage 1: Prompt received
    this.stage.set('prompt');
    this.addLog('PROMPT', `Problem received: "${request.problemDescription.substring(0, 80)}..."`, 'info');

    // Small delay so the user sees the prompt node activate
    await this.delay(600);

    // Stage 2: TRIZ Engine
    this.stage.set('triz');
    this.addLog('TRIZ', `Querying contradiction matrix [${request.improvingParam}, ${request.preservingParam}]...`, 'info');

    try {
      const trizResult = await firstValueFrom(
        this.trizHttp.browseMatrix([request.improvingParam], [request.preservingParam])
      );
      this.principlesText.set(trizResult.result);
      this.addLog('TRIZ', `✓ Principles extracted successfully`, 'success');
    } catch (err) {
      this.addLog('TRIZ', `✗ Failed to query TRIZ matrix: ${err}`, 'error');
      this.stage.set('error');
      return;
    }

    // Small delay for visual effect
    await this.delay(400);

    // Stage 3: Gemini LLM
    this.stage.set('gemini');
    this.addLog('GEMINI', `Sending problem + principles to Gemini LLM...`, 'info');

    try {
      const candidates = await firstValueFrom(
        this.googleHttp.generateSolutions(request.problemDescription, this.principlesText())
      );
      this.candidates.set(candidates);
      this.addLog('GEMINI', `✓ Generated ${candidates.length} candidate solutions`, 'success');
    } catch (err) {
      this.addLog('GEMINI', `✗ Gemini generation failed: ${err}`, 'error');
      this.stage.set('error');
      return;
    }

    await this.delay(400);

    // Stage 4: Arena Evaluator
    this.stage.set('arena');
    this.addLog('ARENA', `Scoring and ranking candidates...`, 'info');

    await this.delay(800); // Simulate scoring time

    const winner = this.candidates().find((c: any) => c.winner);
    if (winner) {
      const metrics = ['recovery', 'scalability', 'cost', 'safety', 'speed'];
      let total = 0;
      let count = 0;
      for (const m of metrics) {
        if (typeof winner[m] === 'number') {
          total += winner[m];
          count++;
        }
      }
      const overall = count > 0 ? (total / count).toFixed(1) : 'N/A';
      this.addLog('ARENA', `✓ Winner: ${winner.title} (Overall: ${overall}/10)`, 'success');
    } else {
      this.addLog('ARENA', `✓ Scoring complete — no clear winner`, 'success');
    }

    await this.delay(400);

    // Stage 5: Done
    this.stage.set('done');
    this.addLog('DONE', `Pipeline complete. ${this.candidates().length} solutions ready.`, 'success');

    // Wait a couple of seconds so the user sees the pipeline finish, then navigate to results
    await this.delay(2000);
    this.router.navigate(['/arena']);
  }

  /** Reset pipeline to idle */
  reset() {
    this.stage.set('idle');
    this.logs.set([]);
    this.candidates.set([]);
    this.principlesText.set('');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
