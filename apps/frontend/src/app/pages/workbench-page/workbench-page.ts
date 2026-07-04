import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PipelineService } from '../../services/pipeline.service';
import { AgButton } from '../../components/ag-button/ag-button';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgInput } from '../../components/ag-input/ag-input';
import { AgSegmentedToggle } from '../../components/ag-segmented-toggle/ag-segmented-toggle';

@Component({
  selector: 'app-workbench-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AgButton,
    AgCard,
    AgInput,
    AgSegmentedToggle,
  ],
  template: `
    <header class="sticky top-0 z-50 bg-[#1C1C1E]/80 backdrop-blur-md border-b border-[#38383A] h-16">
      <div class="max-w-[1440px] mx-auto px-10 h-full flex items-center justify-between">
        <div class="flex items-baseline gap-3 w-1/4">
          <span class="font-headline-md text-lg font-semibold text-white">Giggs R&amp;D</span>
          <span class="font-caption text-xs text-[#636366]">[Unified TRIZ/LCA Engine]</span>
        </div>
        
        <div class="flex-grow flex justify-center w-2/4">
          <ag-segmented-toggle
            [options]="['Step-by-Step Workbench', 'Executive Summary']"
            [selectedIndex]="activeMode()"
            (selectionChange)="activeMode.set($event)"
            [buttonWidth]="180" />
        </div>
        
        <div class="w-1/4 flex justify-end gap-4 text-[#636366] items-center">
          <a routerLink="/settings" class="hover:text-white transition-colors flex items-center"><span class="material-symbols-outlined">settings</span></a>
          <button class="hover:text-white transition-colors"><span class="material-symbols-outlined">account_circle</span></button>
        </div>
      </div>
    </header>

    <main class="max-w-[1440px] mx-auto px-10 pt-6 flex flex-col md:flex-row gap-6">
      <!-- Left Column: Input -->
      <aside class="w-full md:w-[45%] flex flex-col gap-6 shrink-0 h-fit md:sticky md:top-24">
        <!-- Problem Input Card -->
        <ag-card>
          <h2 class="font-headline-sm text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#636366]">description</span>
            1. Problem Input
          </h2>
          
          <ag-input
            type="textarea"
            placeholder="Describe the e-waste or end-of-life disassembly challenge..."
            [(ngModel)]="problemDescription"
            [rows]="7" />
            
          <p class="text-xs text-[#8E8E93] mt-4">
            The Inventing Machine will automatically extract the technical contradiction, map the parameters, perform Deep Research for LCA, and evaluate the final candidates.
          </p>
        </ag-card>

        <!-- Primary Action Button -->
        <button ag-button variant="primary" (click)="generateSolutions()" [disabled]="isRunning()">
          @if (isRunning()) {
            <span class="material-symbols-outlined text-sm">hourglass_empty</span>
          }
          {{ isRunning() ? 'Orchestrating Process...' : 'Generate Solutions via Unified Engine' }}
          @if (!isRunning()) {
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          }
        </button>
      </aside>

      <!-- Right Column: Outputs -->
      <article class="w-full md:w-[55%] flex flex-col gap-6">
        <header class="flex items-center justify-between pb-2 border-b border-[#38383A]">
          <h2 class="font-headline-md text-base font-semibold text-white">System Status</h2>
        </header>

        <div class="flex flex-col gap-4">
          @if (stage() === 'idle') {
            <div class="p-10 border border-dashed border-[#38383A] rounded-xl flex flex-col items-center justify-center text-center gap-3">
              <span class="material-symbols-outlined text-[#636366] text-4xl">psychology</span>
              <p class="text-[#8E8E93] text-sm">Enter a problem description and start the engine to see the automated reasoning pipeline in action.</p>
            </div>
          } @else {
            <ag-card>
              <h3 class="font-headline-sm text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#0A84FF]">terminal</span>
                Execution Pipeline
              </h3>
              
              <div class="flex flex-col gap-3 font-mono text-xs">
                @for (log of logs(); track log.timestamp) {
                  <div class="flex gap-3 items-start">
                    <span class="text-[#636366] shrink-0">[{{ log.timestamp }}]</span>
                    <span class="shrink-0" [ngClass]="{
                      'text-[#0A84FF]': log.type === 'info',
                      'text-[#30D158]': log.type === 'success',
                      'text-[#FF453A]': log.type === 'error'
                    }">[{{ log.stage }}]</span>
                    <span class="text-white break-words">{{ log.message }}</span>
                  </div>
                }
                
                @if (isRunning()) {
                  <div class="flex gap-2 items-center mt-2 text-[#0A84FF]">
                    <span class="w-2 h-2 rounded-full bg-[#0A84FF] animate-pulse"></span>
                    <span>Waiting for completion...</span>
                  </div>
                }
              </div>
            </ag-card>
          }
        </div>
      </article>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkbenchPage {
  private readonly router = inject(Router);
  public readonly pipelineService = inject(PipelineService);

  activeMode = signal(0);
  problemDescription = signal('');
  
  isRunning = this.pipelineService.isRunning;
  stage = this.pipelineService.stage;
  logs = this.pipelineService.logs;

  generateSolutions() {
    if (!this.problemDescription()) {
      alert('Please enter a problem description first.');
      return;
    }

    // Start the pipeline. The pipeline will automatically navigate to /arena when done.
    this.pipelineService.startPipeline({
      problemDescription: this.problemDescription(),
    });
    
    // We can navigate to topology immediately if we want to watch the graph, 
    // but the terminal logs on this page are also cool. Let's redirect to topology for the visualization.
    this.router.navigate(['/topology']);
  }
}
