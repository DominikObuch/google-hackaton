import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgBadge } from '../../components/ag-badge/ag-badge';
import { PipelineService } from '../../services/pipeline.service';

@Component({
  selector: 'app-arena-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AgCard,
    AgBadge,
  ],
  template: `
    <div class="hidden md:flex justify-between items-center w-full px-10 py-6 border-b border-[#38383A]">
      <div class="flex flex-col gap-1">
        <h2 class="font-display-lg text-2xl font-bold text-white">Automated Evaluation Arena</h2>
        @if (trail()) {
          <span class="text-[#8E8E93] text-sm max-w-2xl line-clamp-1">Problem: {{ trail()?.originalProblem }}</span>
        }
      </div>
      <div class="flex gap-4 items-center">
        <a routerLink="/settings" class="text-[#636366] hover:text-white transition-colors flex items-center"><span class="material-symbols-outlined">settings</span></a>
        <button class="text-[#636366] hover:text-white transition-colors"><span class="material-symbols-outlined">account_circle</span></button>
      </div>
    </div>

    <div class="px-10 py-6 flex flex-col lg:flex-row gap-6 max-w-[1440px] mx-auto w-full" *ngIf="trail()">
      <!-- Left Column: Candidates & Interactive Scorers -->
      <div class="w-full lg:w-[45%] flex flex-col gap-6">
        <ng-container *ngFor="let candidate of trail()?.candidates; let i = index">
          <ag-card [winner]="candidate.isWinner || false">
            <div class="flex justify-between items-start">
              <h3 class="font-headline-sm text-base font-semibold text-white">Candidate: {{ candidate.title }}</h3>
              <div class="flex gap-2">
                 <ag-badge [theme]="candidate.source === 'LCA' ? 'success' : 'primary'">{{ candidate.source }}</ag-badge>
              </div>
            </div>
            <p class="text-xs text-[#8E8E93] leading-relaxed mt-2">{{ candidate.description }}</p>
            
            <div *ngIf="candidate.principles" class="mt-2 text-xs text-[#0A84FF]">
              Principles: {{ candidate.principles }}
            </div>

            <!-- Deep Research / Scientific Papers -->
            <div *ngIf="candidate.scientificPapers?.length" class="mt-4 pt-3 border-t border-[#38383A]">
              <h4 class="text-[10px] uppercase tracking-wider text-[#8E8E93] mb-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">science</span> Deep Research
              </h4>
              <div class="flex flex-col gap-2">
                <div *ngFor="let paper of candidate.scientificPapers" class="bg-[#1C1C1E] p-2 rounded border border-[#2C2C2E]">
                  <a [href]="paper.url" target="_blank" class="text-xs text-[#0A84FF] hover:underline font-medium block truncate">{{ paper.title }}</a>
                  <p class="text-[10px] text-[#636366] mt-1 leading-tight line-clamp-2">{{ paper.summary }}</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-3 mt-4 border-t border-[#38383A] pt-4">
              <div *ngFor="let m of metrics" class="flex flex-col gap-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-[#8E8E93]">{{ m.label }}</span>
                  <span class="text-white">{{ getScore(candidate.id, m.name) }}/10</span>
                </div>
                <input type="range" min="1" max="10" step="1"
                       [ngModel]="getScore(candidate.id, m.name)"
                       (ngModelChange)="setScore(candidate.id, m.name, $event)"
                       class="w-full h-1 bg-[#1C1C1E] rounded-lg appearance-none cursor-pointer"
                       [style.accent-color]="i === 0 ? '#0A84FF' : (i === 1 ? '#30D158' : '#FF9F0A')" />
              </div>
              <div class="flex justify-between items-center text-xs font-bold pt-2 border-t border-dashed border-[#2C2C2E]">
                <span class="text-white">Overall Score</span>
                <span [ngClass]="candidate.isWinner ? 'text-[#30D158]' : 'text-white'">{{ candidate.overallScore }}/10</span>
              </div>
            </div>
          </ag-card>
        </ng-container>
      </div>

      <!-- Right Column: Radar Chart Visualizer & Comments -->
      <div class="w-full lg:w-[55%] flex flex-col gap-6">
        <ag-card>
          <h3 class="font-headline-sm text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#8E8E93]">analytics</span>
            Design Metrics Radar Canvas
          </h3>
          
          <div class="flex justify-center items-center py-4 bg-[#131315] border border-[#38383A] rounded-xl relative overflow-hidden min-h-[360px]">
            <svg class="w-full max-w-[340px] h-[340px]" viewBox="0 0 200 200">
              <!-- Radial Grid Web -->
              <circle cx="100" cy="100" r="80" class="radar-grid" />
              <circle cx="100" cy="100" r="60" class="radar-grid" />
              <circle cx="100" cy="100" r="40" class="radar-grid" />
              <circle cx="100" cy="100" r="20" class="radar-grid" />
              
              <!-- Axes Lines -->
              @for (coord of axisCoords(); track $index) {
                <line x1="100" y1="100" [attr.x2]="coord.x" [attr.y2]="coord.y" class="radar-line" />
              }

              <!-- Axis Label Names -->
              @for (coord of labelCoords(); track coord.label) {
                <text [attr.x]="coord.x" [attr.y]="coord.y"
                      class="fill-[#8E8E93] text-[6px] font-semibold text-center font-sans"
                      dominant-baseline="middle" text-anchor="middle">
                  {{ coord.label }}
                </text>
              }
              
              <polygon *ngFor="let poly of polyPoints(); let i = index" [attr.points]="poly" [ngClass]="getPolygonClass(i)" />
            </svg>
            
            <!-- Legend Indicators -->
            <div class="absolute bottom-4 right-4 flex flex-col gap-2 bg-[#2C2C2E] border border-[#38383A] p-3 rounded-lg text-[10px] max-w-[200px]">
              <div *ngFor="let candidate of trail()?.candidates; let i = index" class="flex items-center gap-2">
                <span class="w-3 h-3 border rounded-sm shrink-0" 
                      [ngClass]="getLegendColorClass(i)"></span>
                <span class="text-white font-medium truncate">{{ candidate.title }}</span>
              </div>
            </div>
          </div>
        </ag-card>

        <!-- Evaluation Commentary -->
        <ag-card>
          <h3 class="font-headline-sm text-sm font-semibold text-white">System Evaluation Commentary</h3>
          <div class="flex flex-col gap-4 mt-2">
            <div class="bg-[#1C1C1E] border border-[#38383A] rounded-lg p-4">
              <span class="text-xs text-[#30D158] font-mono font-medium block mb-1">Final Justification</span>
              <p class="text-xs text-[#8E8E93] leading-relaxed" [innerHTML]="formatDescription(trail()?.finalJustification || '')"></p>
            </div>

            <!-- Individual Reasoning -->
            <div class="flex flex-col gap-2">
              <h4 class="text-[10px] uppercase tracking-wider text-[#636366] mt-2">Candidate Reasonings</h4>
              <div *ngFor="let candidate of trail()?.candidates" class="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg p-3">
                 <span class="text-xs font-semibold text-white block mb-1">{{ candidate.title }}</span>
                 <p class="text-[11px] text-[#8E8E93] leading-relaxed">{{ candidate.reasoning }}</p>
              </div>
            </div>
          </div>
        </ag-card>
      </div>
    </div>
    
    <div *ngIf="!trail() && !loading()" class="p-10 flex flex-col items-center gap-4 text-center mt-20">
      <span class="material-symbols-outlined text-5xl text-[#636366]">science</span>
      <div class="text-white text-lg">No Analysis Data Available</div>
      <p class="text-[#8E8E93] text-sm max-w-md">The Unified TRIZ/LCA reasoning trail has not been generated yet. Please start a new session from the Workbench.</p>
      <a routerLink="/workbench" class="mt-4 px-6 py-2 bg-[#0A84FF] text-white text-sm font-semibold rounded-lg hover:bg-[#007AFF] transition-colors">Go to Workbench</a>
    </div>
    
    <div *ngIf="loading()" class="p-10 flex flex-col justify-center items-center h-64 text-[#8E8E93] font-mono text-sm gap-4">
       <span class="material-symbols-outlined animate-spin text-2xl">autorenew</span>
       <span>Initializing Automated Evaluation Arena...</span>
    </div>
  `,
  styles: [`
    .radar-line { stroke: #38383A; stroke-width: 1; fill: none; }
    .radar-grid { stroke: #38383A; stroke-width: 0.5; stroke-dasharray: 4; fill: none; }
    .candidate-0 { fill: rgba(10, 132, 255, 0.15); stroke: #0A84FF; stroke-width: 1.5; }
    .candidate-1 { fill: rgba(48, 209, 88, 0.18); stroke: #30D158; stroke-width: 1.5; }
    .candidate-2 { fill: rgba(255, 159, 10, 0.18); stroke: #FF9F0A; stroke-width: 1.5; }
    .candidate-3 { fill: rgba(191, 90, 242, 0.18); stroke: #BF5AF2; stroke-width: 1.5; }
    .candidate-4 { fill: rgba(255, 69, 58, 0.18); stroke: #FF453A; stroke-width: 1.5; }
    .candidate-5 { fill: rgba(100, 210, 255, 0.18); stroke: #64D2FF; stroke-width: 1.5; }
    .legend-0 { background-color: rgba(10, 132, 255, 0.2); border-color: #0A84FF; }
    .legend-1 { background-color: rgba(48, 209, 88, 0.2); border-color: #30D158; }
    .legend-2 { background-color: rgba(255, 159, 10, 0.2); border-color: #FF9F0A; }
    .legend-3 { background-color: rgba(191, 90, 242, 0.2); border-color: #BF5AF2; }
    .legend-4 { background-color: rgba(255, 69, 58, 0.2); border-color: #FF453A; }
    .legend-5 { background-color: rgba(100, 210, 255, 0.2); border-color: #64D2FF; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArenaPage implements OnInit {
  private pipelineService = inject(PipelineService);
  
  trail = this.pipelineService.reasoningTrail;
  loading = signal(true);
  
  scoresState = signal<Record<string, Record<string, number>>>({});

  metrics = [
    { name: 'feasibilityScore', label: 'Feasibility' },
    { name: 'sustainabilityScore', label: 'Sustainability' },
    { name: 'costScore', label: 'Cost Efficiency' },
    { name: 'impactScore', label: 'Impact / Scalability' }
  ];

  ngOnInit() {
    // Read the trail from PipelineService directly (synchronous)
    const currentTrail = this.trail();
    if (currentTrail) {
      const initialScores: Record<string, Record<string, number>> = {};
      currentTrail.candidates.forEach((c: any) => {
        initialScores[c.id] = { 
          feasibilityScore: c.feasibilityScore,
          sustainabilityScore: c.sustainabilityScore,
          costScore: c.costScore,
          impactScore: c.impactScore
        };
      });
      this.scoresState.set(initialScores);
    }
    
    // Tiny delay to avoid UI jitter
    setTimeout(() => {
      this.loading.set(false);
    }, 300);
  }

  getScore(candidateId: string, metric: string): number {
    return this.scoresState()[candidateId]?.[metric] || 0;
  }

  setScore(candidateId: string, metric: string, value: number) {
    this.scoresState.update(state => {
      return {
        ...state,
        [candidateId]: {
          ...state[candidateId],
          [metric]: Number(value)
        }
      };
    });
  }

  // Precomputed coordinates for axes (4 metrics = Diamond/Square shape)
  axisCoords = signal([
    { x: 100, y: 20 },   // Top
    { x: 180, y: 100 },  // Right
    { x: 100, y: 180 },  // Bottom
    { x: 20, y: 100 }    // Left
  ]);

  labelCoords = computed(() => {
    // We have exactly 4 metrics
    const defaultCoords = [
      { x: 100, y: 10 },
      { x: 190, y: 100 },
      { x: 100, y: 190 },
      { x: 10, y: 100 }
    ];
    
    return this.metrics.map((m, i) => ({
      x: defaultCoords[i]?.x || 100,
      y: defaultCoords[i]?.y || 100,
      label: m.label
    }));
  });

  // Reactive computed points calculation
  polyPoints = computed(() => {
    const tr = this.trail();
    if (!tr) return [];
    const state = this.scoresState();
    
    return tr.candidates.map((c: any) => this.calculatePolygonPoints(state[c.id]));
  });

  private calculatePolygonPoints(scores: Record<string, number>): string {
    if (!scores) return '';
    const radius = 80;
    const center = 100;
    // 4 angles for a diamond chart: 0 (top), 90 (right), 180 (bottom), 270 (left) - adjusting radians
    const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

    return this.metrics.map((m, i) => {
      const scale = (scores[m.name] || 0) / 10;
      const r = radius * scale;
      const angle = angles[i] !== undefined ? angles[i] : 0;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  getPolygonClass(index: number): string {
    return `candidate-${index % 6}`;
  }
  
  getLegendColorClass(index: number): string {
    return `legend-${index % 6}`;
  }

  formatDescription(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }
}
