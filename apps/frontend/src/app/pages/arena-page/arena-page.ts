import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgBadge } from '../../components/ag-badge/ag-badge';

interface Metric {
  name: string;
  label: string;
}

@Component({
  selector: 'app-arena-page',
  imports: [
    CommonModule,
    FormsModule,
    AgCard,
    AgBadge,
  ],
  template: `
    <div class="hidden md:flex justify-between items-center w-full px-10 py-6 border-b border-[#38383A]">
      <h2 class="font-display-lg text-2xl font-bold text-white">Automated Evaluation Arena</h2>
      <div class="flex gap-4">
        <button class="text-[#636366] hover:text-white transition-colors"><span class="material-symbols-outlined">settings</span></button>
        <button class="text-[#636366] hover:text-white transition-colors"><span class="material-symbols-outlined">account_circle</span></button>
      </div>
    </div>

    <div class="px-10 py-6 flex flex-col lg:flex-row gap-6 max-w-[1440px] mx-auto w-full">
      <!-- Left Column: Candidates & Interactive Scorers -->
      <div class="w-full lg:w-[35%] flex flex-col gap-6">
        <!-- Candidate A -->
        <ag-card>
          <div class="flex justify-between items-start">
            <h3 class="font-headline-sm text-base font-semibold text-white">Candidate A: Bio-Leaching</h3>
            <ag-badge theme="muted">Chemical Process</ag-badge>
          </div>
          <p class="text-xs text-[#8E8E93] leading-relaxed">Uses specialized bacteria (Acidithiobacillus) in mild acid solutions to dissolve and isolate rare earth elements from shredded PCBs.</p>
          
          <div class="space-y-3 mt-2 border-t border-[#38383A] pt-4">
            @for (m of metrics; track m.name) {
              <div class="flex flex-col gap-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-[#8E8E93]">{{ m.label }}</span>
                  <span class="text-white">{{ getScore('A', m.name) }}/10</span>
                </div>
                <input type="range" min="1" max="10" step="1"
                       [ngModel]="getScore('A', m.name)"
                       (ngModelChange)="setScore('A', m.name, $event)"
                       class="w-full h-1 bg-[#1C1C1E] rounded-lg appearance-none cursor-pointer accent-[#0A84FF]" />
              </div>
            }
          </div>
        </ag-card>

        <!-- Candidate B -->
        <ag-card [winner]="true">
          <div class="flex justify-between items-start">
            <h3 class="font-headline-sm text-base font-semibold text-white">Candidate B: Project Giggs</h3>
            <ag-badge theme="success">Winner</ag-badge>
          </div>
          <p class="text-xs text-[#8E8E93] leading-relaxed">Electro-Active Debonding Adhesives releasing via 12V DC current within 10 seconds. Highly clean separation.</p>

          <div class="space-y-3 mt-2 border-t border-[#38383A] pt-4">
            @for (m of metrics; track m.name) {
              <div class="flex flex-col gap-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-[#8E8E93]">{{ m.label }}</span>
                  <span class="text-white">{{ getScore('B', m.name) }}/10</span>
                </div>
                <input type="range" min="1" max="10" step="1"
                       [ngModel]="getScore('B', m.name)"
                       (ngModelChange)="setScore('B', m.name, $event)"
                       class="w-full h-1 bg-[#1C1C1E] rounded-lg appearance-none cursor-pointer accent-[#30D158]" />
              </div>
            }
          </div>
        </ag-card>
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
              
              <!-- Candidate A Area Polygon (Blue) -->
              <polygon [attr.points]="polyPointsA()" class="candidate-a" />
              
              <!-- Candidate B Area Polygon (Green) -->
              <polygon [attr.points]="polyPointsB()" class="candidate-b" />
            </svg>
            
            <!-- Legend Indicators -->
            <div class="absolute bottom-4 right-4 flex flex-col gap-2 bg-[#2C2C2E] border border-[#38383A] p-3 rounded-lg text-[10px]">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-[#0A84FF]/20 border border-[#0A84FF] rounded-sm"></span>
                <span class="text-white font-medium">Candidate A (Bio-Leaching)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-[#30D158]/20 border border-[#30D158] rounded-sm"></span>
                <span class="text-white font-medium">Candidate B (Project Giggs)</span>
              </div>
            </div>
          </div>
        </ag-card>

        <!-- Evaluation Commentary -->
        <ag-card>
          <h3 class="font-headline-sm text-sm font-semibold text-white">System Evaluation Commentary</h3>
          <div class="flex flex-col gap-4 mt-2">
            <div class="bg-[#1C1C1E] border border-[#38383A] rounded-lg p-4">
              <span class="text-xs text-[#30D158] font-mono font-medium block mb-1">Recommendation Summary</span>
              <p class="text-xs text-[#8E8E93] leading-relaxed">
                Candidate B (Project Giggs) scores significantly higher in <strong>Speed</strong> (10s activation vs. weeks for bio-leaching) and <strong>Safety</strong> (inert voltage adhesive release vs. strong acids). It is recommended as the prime candidate for high-throughput Giggs processing lines.
              </p>
            </div>
          </div>
        </ag-card>
      </div>
    </div>
  `,
  styles: [`
    .radar-line { stroke: #38383A; stroke-width: 1; fill: none; }
    .radar-grid { stroke: #38383A; stroke-width: 0.5; stroke-dasharray: 4; fill: none; }
    .candidate-a { fill: rgba(10, 132, 255, 0.15); stroke: #0A84FF; stroke-width: 1.5; }
    .candidate-b { fill: rgba(48, 209, 88, 0.18); stroke: #30D158; stroke-width: 1.5; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArenaPage {
  metrics: Metric[] = [
    { name: 'recovery', label: 'Recovery Rate' },
    { name: 'scalability', label: 'Scalability' },
    { name: 'cost', label: 'Cost Efficiency' },
    { name: 'safety', label: 'Safety Index' },
    { name: 'speed', label: 'Disassembly Speed' }
  ];

  scoresA = signal<Record<string, number>>({
    recovery: 9,
    scalability: 6,
    cost: 8,
    safety: 7,
    speed: 5
  });

  scoresB = signal<Record<string, number>>({
    recovery: 10,
    scalability: 8,
    cost: 9,
    safety: 9,
    speed: 10
  });

  getScore(candidate: 'A' | 'B', metric: string): number {
    return candidate === 'A' ? this.scoresA()[metric] : this.scoresB()[metric];
  }

  setScore(candidate: 'A' | 'B', metric: string, value: number) {
    const updated = { ... (candidate === 'A' ? this.scoresA() : this.scoresB()), [metric]: Number(value) };
    if (candidate === 'A') {
      this.scoresA.set(updated);
    } else {
      this.scoresB.set(updated);
    }
  }

  // Precomputed coordinates for axes
  axisCoords = signal([
    { x: 100, y: 20 },   // Axis 0: pointing up
    { x: 176, y: 75 },   // Axis 1
    { x: 147, y: 165 },  // Axis 2
    { x: 53, y: 165 },   // Axis 3
    { x: 24, y: 75 }     // Axis 4
  ]);

  labelCoords = signal([
    { x: 100, y: 10, label: 'Recovery' },
    { x: 180, y: 75, label: 'Scalability' },
    { x: 150, y: 175, label: 'Cost' },
    { x: 50, y: 175, label: 'Safety' },
    { x: 18, y: 75, label: 'Speed' }
  ]);

  // Reactive computed points calculation
  polyPointsA = computed(() => this.calculatePolygonPoints(this.scoresA()));
  polyPointsB = computed(() => this.calculatePolygonPoints(this.scoresB()));

  private calculatePolygonPoints(scores: Record<string, number>): string {
    const radius = 80;
    const center = 100;
    const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];
    const keys = ['recovery', 'scalability', 'cost', 'safety', 'speed'];

    return keys.map((key, i) => {
      const scale = (scores[key] || 0) / 10;
      const r = radius * scale;
      const x = center + r * Math.cos(angles[i]);
      const y = center + r * Math.sin(angles[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
