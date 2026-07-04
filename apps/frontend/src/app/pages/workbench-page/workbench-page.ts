import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrizHttp } from '@workspace/http';
import { AgButton } from '../../components/ag-button/ag-button';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgInput } from '../../components/ag-input/ag-input';
import { AgBadge } from '../../components/ag-badge/ag-badge';
import { AgSegmentedToggle } from '../../components/ag-segmented-toggle/ag-segmented-toggle';

interface Candidate {
  title: string;
  description: string;
  recovery: string;
  scalability: string;
  overall: string;
  winner: boolean;
  principles?: string;
}

@Component({
  selector: 'app-workbench-page',
  imports: [
    CommonModule,
    FormsModule,
    AgButton,
    AgCard,
    AgInput,
    AgBadge,
    AgSegmentedToggle,
  ],
  template: `
    <header class="sticky top-0 z-50 bg-[#1C1C1E]/80 backdrop-blur-md border-b border-[#38383A] h-16">
      <div class="max-w-[1440px] mx-auto px-10 h-full flex items-center justify-between">
        <div class="flex items-baseline gap-3 w-1/4">
          <span class="font-headline-md text-lg font-semibold text-white">Giggs R&amp;D</span>
          <span class="font-caption text-xs text-[#636366]">[SDG 12 E-Waste Engine]</span>
        </div>
        
        <div class="flex-grow flex justify-center w-2/4">
          <ag-segmented-toggle
            [options]="['Step-by-Step Workbench', 'Executive Summary']"
            [selectedIndex]="activeMode()"
            (selectionChange)="activeMode.set($event)"
            [buttonWidth]="180" />
        </div>
        
        <div class="w-1/4 flex justify-end gap-4 text-[#636366]">
          <button class="hover:text-white transition-colors"><span class="material-symbols-outlined">settings</span></button>
          <button class="hover:text-white transition-colors"><span class="material-symbols-outlined">account_circle</span></button>
        </div>
      </div>
    </header>

    <main class="max-w-[1440px] mx-auto px-10 pt-6 flex flex-col md:flex-row gap-6">
      <!-- Left Column: Params & Input -->
      <aside class="w-full md:w-[35%] flex flex-col gap-6 shrink-0 h-fit md:sticky md:top-24">
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
            [rows]="5" />
        </ag-card>

        <!-- TRIZ Contradictions Card -->
        <ag-card>
          <h2 class="font-headline-sm text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#636366]">psychology</span>
            2. TRIZ Contradiction Formulated
          </h2>
          
          <div class="flex flex-col gap-4 mt-2">
            <div class="flex flex-col gap-2">
              <label class="font-caption text-xs text-[#8E8E93] uppercase tracking-wider">Feature to Improve</label>
              <select [(ngModel)]="improvingParam" class="bg-[#1C1C1E] rounded-lg px-3 py-2.5 border border-[#38383A] text-sm text-white focus:outline-none focus:border-[#0A84FF] transition-colors w-full">
                <option *ngFor="let p of parameters" [value]="p.id">#{{ p.id }}. {{ p.name }}</option>
              </select>
            </div>
            
            <div class="flex justify-center -my-2 relative z-10">
              <div class="bg-[#2C2C2E] rounded-full p-1 border border-[#38383A]">
                <span class="material-symbols-outlined text-[#0A84FF] text-base block">swap_vert</span>
              </div>
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-caption text-xs text-[#8E8E93] uppercase tracking-wider">Undesired Trade-off</label>
              <select [(ngModel)]="preservingParam" class="bg-[#1C1C1E] rounded-lg px-3 py-2.5 border border-[#38383A] text-sm text-white focus:outline-none focus:border-[#0A84FF] transition-colors w-full">
                <option *ngFor="let p of parameters" [value]="p.id">#{{ p.id }}. {{ p.name }}</option>
              </select>
            </div>
          </div>
        </ag-card>

        <!-- Primary Action Button -->
        <button ag-button variant="primary" (click)="generateSolutions()" [disabled]="loading()">
          <span class="material-symbols-outlined text-sm" *ngIf="loading()">hourglass_empty</span>
          {{ loading() ? 'Generating...' : 'Generate Solutions via pytriz MCP' }}
          <span class="material-symbols-outlined text-sm" *ngIf="!loading()">arrow_forward</span>
        </button>
      </aside>

      <!-- Right Column: Outputs -->
      <article class="w-full md:w-[65%] flex flex-col gap-6">
        <header class="flex items-center justify-between pb-2 border-b border-[#38383A]">
          <h2 class="font-headline-md text-base font-semibold text-white">3. Top Candidate Solutions &amp; Evaluation</h2>
          <button class="text-[#8E8E93] hover:text-white flex items-center gap-1 text-xs transition-colors">
            <span class="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
        </header>

        <div class="flex flex-col gap-4">
          <!-- Live Generated Principles if loaded -->
          <div *ngIf="principlesText()" class="p-6 bg-[#2A2A2C] border border-[#0A84FF] rounded-xl flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <h3 class="font-headline-sm text-lg font-semibold text-[#0A84FF]">Extracted TRIZ Principles [{{ improvingParam }}, {{ preservingParam }}]</h3>
              <ag-badge theme="primary">Active Lookup</ag-badge>
            </div>
            <pre class="font-mono text-base text-white whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[450px] bg-[#1C1C1E] p-4 rounded-lg border border-[#38383A]">{{ principlesText() }}</pre>
          </div>

          <!-- Static Candidates -->
          <div *ngFor="let c of candidates()" class="relative">
            <ag-card [winner]="c.winner" [interactive]="!c.winner">
              <div>
                <h3 class="font-headline-sm text-base font-semibold text-white pr-12">{{ c.title }}</h3>
                <p class="text-sm text-[#8E8E93] mt-2 leading-relaxed">{{ c.description }}</p>
              </div>
              
              <div class="flex flex-wrap gap-3 mt-2">
                <ag-badge theme="primary">Recovery: {{ c.recovery }}</ag-badge>
                <ag-badge theme="muted">Scalability: {{ c.scalability }}</ag-badge>
                <ag-badge [theme]="c.winner ? 'success' : 'muted'">Overall: {{ c.overall }}</ag-badge>
              </div>
            </ag-card>
          </div>
        </div>
      </article>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkbenchPage {
  private readonly trizHttp = inject(TrizHttp);

  activeMode = signal(0);
  problemDescription = signal('');
  improvingParam = 12; // Device Thickness / Shape
  preservingParam = 32; // Ease of Disassembly / Manufacturability
  loading = signal(false);
  principlesText = signal('');

  parameters = [
    { id: 1, name: 'Weight of moving object' },
    { id: 2, name: 'Weight of stationary object' },
    { id: 12, name: 'Shape' },
    { id: 27, name: 'Reliability' },
    { id: 29, name: 'Manufacturing precision' },
    { id: 32, name: 'Manufacturability' },
    { id: 35, name: 'Adaptability or versatility' },
    { id: 36, name: 'Device complexity' },
    { id: 39, name: 'Productivity' },
  ];

  candidates = signal<Candidate[]>([
    {
      title: 'Project Giggs: Electro-Active Debonding Adhesives',
      description: 'Applies a 12V DC current to specific contact points, triggering a rapid voltage-induced release of internal adhesives within 10 seconds, leaving structural integrity intact.',
      recovery: '10/10',
      scalability: '8/10',
      overall: '9.2/10',
      winner: true,
    },
    {
      title: 'Modular Snap-Fit Titanium Frame',
      description: 'Employs a custom interlocking latch geometry that secures components without screws or glue, unlocking via simple pneumatic push-key tools.',
      recovery: '8/10',
      scalability: '9/10',
      overall: '8.5/10',
      winner: false,
    },
    {
      title: 'Thermal-Release Polymer Seals',
      description: 'Utilizes co-polymer layers that undergo rapid volume expansion and lose cohesion at exactly 85°C, making simple heat-sorting processes fully automatic.',
      recovery: '9/10',
      scalability: '7/10',
      overall: '7.8/10',
      winner: false,
    }
  ]);

  generateSolutions() {
    this.loading.set(true);
    this.trizHttp.browseMatrix([this.improvingParam], [this.preservingParam]).subscribe({
      next: (res) => {
        this.principlesText.set(res.result);
        this.loading.set(false);
      },
      error: () => {
        this.principlesText.set('Error querying contradiction matrix from the Python FastMCP server.');
        this.loading.set(false);
      }
    });
  }
}
