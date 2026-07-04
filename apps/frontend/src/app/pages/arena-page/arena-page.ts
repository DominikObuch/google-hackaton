import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgBadge } from '../../components/ag-badge/ag-badge';
import { EvaluationArenaResponse, Candidate, EvaluationMetric } from '@workspace/http';

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
      <h2 class="font-display-lg text-2xl font-bold text-white">Automated Evaluation Arena</h2>
      <div class="flex gap-4 items-center">
        <a routerLink="/settings" class="text-[#636366] hover:text-white transition-colors flex items-center"><span class="material-symbols-outlined">settings</span></a>
        <button class="text-[#636366] hover:text-white transition-colors"><span class="material-symbols-outlined">account_circle</span></button>
      </div>
    </div>

    <div class="px-10 py-6 flex flex-col lg:flex-row gap-6 max-w-[1440px] mx-auto w-full" *ngIf="data()">
      <!-- Left Column: Candidates & Interactive Scorers -->
      <div class="w-full lg:w-[35%] flex flex-col gap-6">
        <ng-container *ngFor="let candidate of data()?.candidates; let i = index">
          <ag-card [winner]="candidate.isWinner || false">
            <div class="flex justify-between items-start">
              <h3 class="font-headline-sm text-base font-semibold text-white">Candidate {{ candidate.id }}: {{ candidate.name }}</h3>
              <div class="flex gap-2">
                 <ag-badge *ngFor="let tag of candidate.tags" [theme]="tag.theme">{{ tag.label }}</ag-badge>
              </div>
            </div>
            <p class="text-xs text-[#8E8E93] leading-relaxed mt-2">{{ candidate.description }}</p>
            
            <div class="space-y-3 mt-4 border-t border-[#38383A] pt-4">
              <div *ngFor="let m of data()?.metrics" class="flex flex-col gap-1">
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
            </div>
          </ag-card>
        </ng-container>
      </div>

      <!-- Right Column: Radar Chart Visualizer & Comments -->
      <div class="w-full lg:w-[65%] flex flex-col gap-6">
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
            <div class="absolute bottom-4 right-4 flex flex-col gap-2 bg-[#2C2C2E] border border-[#38383A] p-3 rounded-lg text-[10px]">
              <div *ngFor="let candidate of data()?.candidates; let i = index" class="flex items-center gap-2">
                <span class="w-3 h-3 border rounded-sm" 
                      [ngClass]="getLegendColorClass(i)"></span>
                <span class="text-white font-medium">Candidate {{ candidate.id }} ({{ candidate.name }})</span>
              </div>
            </div>
          </div>
        </ag-card>

        <!-- Evaluation Commentary -->
        <ag-card>
          <h3 class="font-headline-sm text-sm font-semibold text-white">System Evaluation Commentary</h3>
          <div class="flex flex-col gap-4 mt-2">
            <div class="bg-[#1C1C1E] border border-[#38383A] rounded-lg p-4">
              <span class="text-xs text-[#30D158] font-mono font-medium block mb-1">{{ data()?.commentary?.title }}</span>
              <p class="text-xs text-[#8E8E93] leading-relaxed" [innerHTML]="formatDescription(data()?.commentary?.description || '')"></p>
            </div>
          </div>
        </ag-card>
      </div>
    </div>
    
    <div *ngIf="!data() && !loading()" class="p-10 text-white">Failed to load evaluation data.</div>
    <div *ngIf="loading()" class="p-10 text-[#8E8E93] font-mono text-sm">Initializing Automated Evaluation Arena...</div>
  `,
  styles: [`
    .radar-line { stroke: #38383A; stroke-width: 1; fill: none; }
    .radar-grid { stroke: #38383A; stroke-width: 0.5; stroke-dasharray: 4; fill: none; }
    .candidate-0 { fill: rgba(10, 132, 255, 0.15); stroke: #0A84FF; stroke-width: 1.5; }
    .candidate-1 { fill: rgba(48, 209, 88, 0.18); stroke: #30D158; stroke-width: 1.5; }
    .candidate-2 { fill: rgba(255, 159, 10, 0.18); stroke: #FF9F0A; stroke-width: 1.5; }
    .legend-0 { background-color: rgba(10, 132, 255, 0.2); border-color: #0A84FF; }
    .legend-1 { background-color: rgba(48, 209, 88, 0.2); border-color: #30D158; }
    .legend-2 { background-color: rgba(255, 159, 10, 0.2); border-color: #FF9F0A; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArenaPage implements OnInit {
  private http = inject(HttpClient);
  
  data = signal<EvaluationArenaResponse | null>(null);
  loading = signal(true);
  
  scoresState = signal<Record<string, Record<string, number>>>({});

  ngOnInit() {
    this.http.get<EvaluationArenaResponse>('arena/evaluations').subscribe({
      next: (res) => {
        this.data.set(res);
        const initialScores: Record<string, Record<string, number>> = {};
        res.candidates.forEach((c: Candidate) => {
          initialScores[c.id] = { ...c.scores };
        });
        this.scoresState.set(initialScores);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch arena data', err);
        this.loading.set(false);
      }
    });
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

  // Precomputed coordinates for axes
  axisCoords = signal([
    { x: 100, y: 20 },   // Axis 0: pointing up
    { x: 176, y: 75 },   // Axis 1
    { x: 147, y: 165 },  // Axis 2
    { x: 53, y: 165 },   // Axis 3
    { x: 24, y: 75 }     // Axis 4
  ]);

  labelCoords = computed(() => {
    const metrics = this.data()?.metrics;
    if (!metrics) return [];
    
    // We assume max 5 metrics for this specific radar chart layout
    const defaultCoords = [
      { x: 100, y: 10 },
      { x: 180, y: 75 },
      { x: 150, y: 175 },
      { x: 50, y: 175 },
      { x: 18, y: 75 }
    ];
    
    return metrics.map((m: EvaluationMetric, i: number) => ({
      x: defaultCoords[i]?.x || 100,
      y: defaultCoords[i]?.y || 100,
      label: m.label
    }));
  });

  // Reactive computed points calculation
  polyPoints = computed(() => {
    const response = this.data();
    if (!response) return [];
    const state = this.scoresState();
    
    return response.candidates.map((c: Candidate) => this.calculatePolygonPoints(state[c.id], response.metrics));
  });

  private calculatePolygonPoints(scores: Record<string, number>, metrics: EvaluationMetric[]): string {
    if (!scores || !metrics) return '';
    const radius = 80;
    const center = 100;
    const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];

    return metrics.map((m, i) => {
      const scale = (scores[m.name] || 0) / 10;
      const r = radius * scale;
      const angle = angles[i] !== undefined ? angles[i] : 0;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  getPolygonClass(index: number): string {
    return `candidate-${index}`;
  }
  
  getLegendColorClass(index: number): string {
    return `legend-${index}`;
  }

  formatDescription(text: string): string {
    // Basic formatting to handle bold text like **Speed**
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }
}
