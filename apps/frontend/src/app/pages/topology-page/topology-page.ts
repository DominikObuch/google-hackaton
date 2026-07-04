import { ChangeDetectionStrategy, Component, Type, input, signal, inject, effect, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  initializeModel,
  NgDiagramComponent,
  NgDiagramNodeTemplate,
  NgDiagramPortComponent,
  NgDiagramBaseEdgeComponent,
  NgDiagramEdgeTemplate,
  SimpleNode,
  Edge,
  provideNgDiagram
} from 'ng-diagram';
import { PipelineService, PipelineStage } from '../../services/pipeline.service';


interface GiggsNodeData {
  label: string;
  icon: string;
  description: string;
  status: 'idle' | 'processing' | 'healthy' | 'winner' | 'error';
  metric: string;
}

interface GiggsEdgeData {
  status?: 'active' | 'done' | 'error' | 'default';
}

@Component({
  selector: 'app-giggs-node',
  imports: [CommonModule, NgDiagramPortComponent],
  host: { style: 'display: block;' },
  template: `
    <div class="relative bg-[#2C2C2E]/90 border rounded-xl p-4 w-[240px] flex flex-col gap-3 transition-all duration-500 text-white shadow-xl"
         [ngClass]="{
           'border-[#38383A]': node().data.status === 'idle',
           'border-[#0A84FF] shadow-[inset_0_0_0_1px_#0A84FF,0_0_20px_rgba(10,132,255,0.15)]': node().data.status === 'processing',
           'border-[#30D158] shadow-[inset_0_0_0_1px_#30D158]': node().data.status === 'healthy' || node().data.status === 'winner',
           'border-[#FF453A] shadow-[inset_0_0_0_1px_#FF453A]': node().data.status === 'error'
         }">
      
      <ng-diagram-port id="port-left" side="left" type="both" class="absolute -left-1 top-1/2 -translate-y-1/2" />
      <ng-diagram-port id="port-right" side="right" type="both" class="absolute -right-1 top-1/2 -translate-y-1/2" />

      @if (node().data.status === 'winner') {
        <div class="absolute -top-2 -right-2 bg-[#2C2C2E] border border-[#30D158] rounded-full p-1 text-[#30D158] flex items-center justify-center animate-bounce">
          <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">star</span>
        </div>
      }
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2 text-white">
          <span class="material-symbols-outlined text-[20px] transition-colors duration-500"
                [ngClass]="{
                  'text-[#8E8E93]': node().data.status === 'idle',
                  'text-[#0A84FF]': node().data.status === 'processing',
                  'text-[#30D158]': node().data.status === 'healthy' || node().data.status === 'winner',
                  'text-[#FF453A]': node().data.status === 'error'
                }">{{ node().data.icon }}</span>
          <span class="font-headline-sm text-sm font-semibold">{{ node().data.label }}</span>
        </div>
        <div class="w-2 h-2 rounded-full transition-colors duration-500"
             [ngClass]="{
               'bg-[#636366]': node().data.status === 'idle',
               'bg-[#0A84FF] animate-pulse': node().data.status === 'processing',
               'bg-[#30D158]': node().data.status === 'healthy' || node().data.status === 'winner',
               'bg-[#FF453A] animate-pulse': node().data.status === 'error'
             }"></div>
      </div>
      
      <p class="font-caption text-xs text-[#8E8E93] leading-relaxed line-clamp-3">{{ node().data.description }}</p>
      
      <div class="mt-auto flex justify-between items-center pt-3 border-t border-[#38383A]/50">
        <div class="font-label-mono text-[10px] px-2 py-0.5 rounded font-mono transition-colors duration-500"
             [ngClass]="{
               'text-[#636366] bg-[#2C2C2E]': node().data.status === 'idle',
               'text-[#0A84FF] bg-[#0A84FF]/10': node().data.status === 'processing',
               'text-[#30D158] bg-[#30D158]/10': node().data.status === 'healthy' || node().data.status === 'winner',
               'text-[#FF453A] bg-[#FF453A]/10': node().data.status === 'error'
             }">
          {{ node().data.metric }}
        </div>
      </div>
    </div>
  `
})
export class GiggsNodeComponent implements NgDiagramNodeTemplate<GiggsNodeData> {
  node = input.required<SimpleNode<GiggsNodeData>>();
}

@Component({
  selector: 'app-custom-edge',
  imports: [NgDiagramBaseEdgeComponent],
  template: `
    <ng-diagram-base-edge
      [edge]="edge()"
      [stroke]="getStrokeColor()"
      [strokeWidth]="getStrokeWidth()"
      [strokeDasharray]="getStrokeDasharray()"
    />
  `
})
export class CustomEdgeComponent implements NgDiagramEdgeTemplate<GiggsEdgeData> {
  edge = input.required<Edge<GiggsEdgeData>>();

  getStrokeColor() {
    const status = this.edge().data?.status;
    if (status === 'active') return '#0A84FF';
    if (status === 'done') return '#30D158';
    if (status === 'error') return '#FF453A';
    return '#38383A';
  }

  getStrokeWidth() {
    const status = this.edge().data?.status;
    if (status === 'active' || status === 'done') return 3;
    return 2;
  }

  getStrokeDasharray() {
    const status = this.edge().data?.status;
    if (status === 'active') return '8 4';
    return undefined;
  }
}

@Component({
  selector: 'app-topology-page',
  imports: [CommonModule, NgDiagramComponent],
  providers: [provideNgDiagram()],
  template: `
    <header class="mb-6 flex justify-between items-end px-10 pt-6">
      <div>
        <h1 class="font-display-lg text-2xl font-bold text-white mb-1">Pipeline Topology</h1>
        <p class="text-sm text-[#8E8E93]">Live view of the TRIZ evaluation pipeline.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <span class="text-xs font-mono px-3 py-1.5 rounded-full border transition-colors duration-300"
              [ngClass]="{
                'text-[#636366] border-[#38383A]': pipeline.stage() === 'idle',
                'text-[#0A84FF] border-[#0A84FF] bg-[#0A84FF]/10': pipeline.isRunning(),
                'text-[#30D158] border-[#30D158] bg-[#30D158]/10': pipeline.stage() === 'done',
                'text-[#FF453A] border-[#FF453A] bg-[#FF453A]/10': pipeline.stage() === 'error'
              }">
          {{ pipeline.stage() === 'idle' ? 'AWAITING INPUT' : pipeline.stage() === 'done' ? 'COMPLETE' : pipeline.stage() === 'error' ? 'ERROR' : 'RUNNING: ' + pipeline.stage().toUpperCase() }}
        </span>
      </div>
    </header>

    <main class="flex-1 px-10 pb-6 flex flex-col gap-4">
      <div class="relative w-full bg-[#131315] border border-[#38383A] rounded-xl overflow-hidden">
        <div class="diagram-container">
          <ng-diagram
            [model]="model()"
            [nodeTemplateMap]="nodeTemplates"
            [edgeTemplateMap]="edgeTemplates"
          />
        </div>
      </div>
      
      <div class="bg-[#1C1C1E] border border-[#38383A] rounded-xl overflow-hidden flex flex-col" style="height: 220px;">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#38383A] shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#636366] text-sm">terminal</span>
            <span class="font-headline-sm text-xs font-semibold text-[#8E8E93]">Pipeline Execution Log</span>
          </div>
          <button *ngIf="pipeline.logs().length > 0" 
                  (click)="pipeline.reset()" 
                  class="text-[10px] text-[#636366] hover:text-white px-2 py-0.5 rounded border border-[#38383A] hover:border-[#636366] transition-colors">
            Clear
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs leading-6">
          <div *ngIf="pipeline.logs().length === 0" class="text-[#636366] italic py-4">
            Waiting for pipeline execution... Submit a prompt from the Workbench to begin.
          </div>
          <div *ngFor="let log of pipeline.logs()" class="flex gap-3">
            <span class="text-[#636366] shrink-0">{{ log.timestamp }}</span>
            <span class="shrink-0 w-[80px]"
                  [ngClass]="{
                    'text-[#8E8E93]': log.type === 'info',
                    'text-[#30D158]': log.type === 'success',
                    'text-[#FF453A]': log.type === 'error'
                  }">[{{ log.stage }}]</span>
            <span [ngClass]="{
                    'text-[#E5E5EA]': log.type === 'info',
                    'text-[#30D158]': log.type === 'success',
                    'text-[#FF453A]': log.type === 'error'
                  }">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .diagram-container {
      display: flex;
      height: 460px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopologyPage {
  private injector = inject(Injector);
  pipeline = inject(PipelineService);
  
  nodeTemplates = new Map<string, Type<NgDiagramNodeTemplate<GiggsNodeData>>>([
    ['giggsNode', GiggsNodeComponent]
  ]);

  edgeTemplates = new Map<string, Type<NgDiagramEdgeTemplate<GiggsEdgeData>>>([
    ['custom', CustomEdgeComponent]
  ]);

  model = signal<any>(initializeModel({ nodes: [], edges: [] }));

  constructor() {
    effect(() => {
      const stage = this.pipeline.stage();
      
      const nodes: any[] = [];
      const edges: any[] = [];
      
      const addNode = (id: string, x: number, y: number, label: string, icon: string, desc: string, status: string, metric: string) => {
        nodes.push({
          id, type: 'giggsNode', position: { x, y }, size: { width: 240, height: 140 }, autoSize: false,
          data: { label, icon, description: desc, status, metric }
        });
      };
      
      const addEdge = (source: string, target: string, status: string) => {
        edges.push({
          id: `link-${source}-${target}`, type: 'custom', source, target, sourcePort: 'port-right', targetPort: 'port-left',
          data: { status }
        });
      };

      if (stage === 'idle') {
        addNode('problem', 50, 160, 'User Problem', 'edit_note', 'Waiting for input...', 'idle', 'IDLE');
        addNode('engine', 350, 160, 'AI Engine', 'psychology', 'Awaiting data...', 'idle', 'IDLE');
        addNode('arena', 650, 160, 'Arena', 'leaderboard', 'Ready to evaluate', 'idle', 'IDLE');
        addEdge('problem', 'engine', 'default');
        addEdge('engine', 'arena', 'default');
      } else {
        // We have active state. Build dynamically based on PipelineService data
        const problemText = this.pipeline.problem();
        const pStatus = stage === 'prompt' ? 'processing' : 'healthy';
        addNode('problem', 50, 160, 'Problem Input', 'edit_note', problemText, pStatus, 'INPUT');
        
        if (stage === 'extracting' || this.pipeline.contradiction()) {
          const contr = this.pipeline.contradiction();
          const cStatus = stage === 'extracting' ? 'processing' : 'healthy';
          const cDesc = contr ? `Improve: ${contr.improvingFeature}\nWorsen: ${contr.worseningFeature}` : 'Extracting Technical Contradiction...';
          addNode('contradiction', 350, 160, 'Contradiction Extractor', 'psychology', cDesc, cStatus, contr ? 'EXTRACTED' : 'ACTIVE');
          addEdge('problem', 'contradiction', 'done');
        }

        const stageGen = stage === 'generating_candidates';
        
        // Show placeholders if generating, or actual nodes if we have candidates
        if (stageGen) {
          addNode('triz_engine', 650, -50, 'TRIZ Generation', 'model_training', 'Querying Matrix & Generating...', 'processing', 'ACTIVE');
          addNode('lca_engine', 650, 160, 'LCA Deep Research', 'science', 'Searching Google for Sustainable solutions...', 'processing', 'ACTIVE');
          addNode('5whys_engine', 650, 370, '5 Whys Deductive', 'psychology_alt', 'Root cause deduction...', 'processing', 'ACTIVE');
          addEdge('contradiction', 'triz_engine', 'active');
          addEdge('contradiction', 'lca_engine', 'active');
          addEdge('contradiction', '5whys_engine', 'active');
        } 
        
        const trizCands = this.pipeline.trizCandidates();
        const lcaCands = this.pipeline.lcaCandidates();
        const fiveWhysCands = this.pipeline.fiveWhysCandidates();
        const allCandidates = [...trizCands, ...lcaCands, ...fiveWhysCands];

        if (allCandidates.length > 0) {
          // Draw actual candidate nodes instead of placeholders
          let tY = 20;
          trizCands.forEach((c, i) => {
            const status = stage === 'evaluating' ? 'processing' : 'healthy';
            addNode(c.id, 650, tY, `TRIZ: ${c.title}`, 'bolt', c.description, status, 'CANDIDATE');
            addEdge('contradiction', c.id, 'done');
            tY += 150;
          });
          
          let lY = tY + 20;
          lcaCands.forEach((c, i) => {
            const status = stage === 'evaluating' ? 'processing' : 'healthy';
            addNode(c.id, 650, lY, `LCA: ${c.title}`, 'eco', c.description, status, 'CANDIDATE');
            addEdge('contradiction', c.id, 'done');
            lY += 150;
          });

          let fY = lY + 20;
          fiveWhysCands.forEach((c, i) => {
            const status = stage === 'evaluating' ? 'processing' : 'healthy';
            addNode(c.id, 650, fY, `5WHYS: ${c.title}`, 'psychology_alt', c.description, status, 'CANDIDATE');
            addEdge('contradiction', c.id, 'done');
            fY += 150;
          });
          
          // The Arena
          const aStatus = stage === 'evaluating' ? 'processing' : 'healthy';
          addNode('arena', 1050, 160, 'Arena Evaluator', 'leaderboard', 'Ranking models against 4 sustainability and feasibility metrics...', aStatus, stage === 'evaluating' ? 'BATTLE' : 'DONE');
          
          allCandidates.forEach(c => {
            addEdge(c.id, 'arena', stage === 'evaluating' ? 'active' : 'done');
          });
        }
        
        if (stage === 'done') {
          const trail = this.pipeline.reasoningTrail();
          if (trail) {
             const winner = trail.candidates.find(c => c.isWinner);
             if (winner) {
               addNode('winner', 1450, 160, `Winner: ${winner.title}`, 'emoji_events', trail.finalJustification, 'winner', `SCORE: ${winner.overallScore}/10`);
               addEdge('arena', 'winner', 'done');
             }
          }
        }
      }

      runInInjectionContext(this.injector, () => {
        this.model.set(initializeModel({ nodes, edges }));
      });
    });
  }
}
