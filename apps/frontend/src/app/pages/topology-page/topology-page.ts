import { ChangeDetectionStrategy, Component, Type, input, signal, inject, effect, Injector, runInInjectionContext, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  initializeModel,
  NgDiagramComponent,
  NgDiagramNodeTemplate,
  NgDiagramPortComponent,
  NgDiagramBaseEdgeComponent,
  NgDiagramEdgeTemplate,
  NgDiagramNodeTemplateMap,
  NgDiagramEdgeTemplateMap,
  SimpleNode,
  Edge,
  provideNgDiagram
} from 'ng-diagram';
import { HttpClient } from '@angular/common/http';
import { PipelineService, PipelineStage } from '../../services/pipeline.service';

/* ---------------------------------------------------------------------------
 * Pipeline stage ordering for comparison
 * --------------------------------------------------------------------------- */
const STAGE_ORDER: PipelineStage[] = ['idle', 'prompt', 'triz', 'gemini', 'arena', 'done'];

function stageIndex(stage: PipelineStage): number {
  return STAGE_ORDER.indexOf(stage);
}

/* Node-to-stage mapping */
const NODE_STAGE_MAP: Record<string, PipelineStage> = {
  'prompt': 'prompt',
  'triz': 'triz',
  'gemini': 'gemini',
  'arena': 'arena',
  'results': 'done',
};

/* Edge-to-stage mapping (edge becomes active when target stage starts) */
const EDGE_TARGET_STAGE: Record<string, PipelineStage> = {
  'link-prompt-triz': 'triz',
  'link-triz-gemini': 'gemini',
  'link-gemini-arena': 'arena',
  'link-arena-results': 'done',
};

interface GiggsNodeData {
  label: string;
  icon: string;
  description: string;
  status: 'idle' | 'processing' | 'healthy' | 'winner' | 'error';
  metric: string;
  metricColor?: string;
  ownerImage?: string;
}

interface GiggsEdgeData {
  status?: 'active' | 'done' | 'error' | 'default';
}

/* ---------------------------------------------------------------------------
 * Custom Node Template Component
 * --------------------------------------------------------------------------- */
@Component({
  selector: 'app-giggs-node',
  imports: [CommonModule, NgDiagramPortComponent],
  host: { style: 'display: block;' },
  template: `
    <div class="relative bg-[#2C2C2E]/90 border rounded-xl p-4 w-[240px] flex flex-col gap-3 transition-all duration-500 text-white shadow-xl"
         [ngClass]="{
           'border-[#38383A]': node().data.status === 'idle',
           'border-[#0A84FF] shadow-[inset_0_0_0_1px_#0A84FF,0_0_20px_rgba(10,132,255,0.15)]': node().data.status === 'processing',
           'border-[#30D158] shadow-[inset_0_0_0_1px_#30D158]': node().data.status === 'healthy',
           'border-[#FF453A] shadow-[inset_0_0_0_1px_#FF453A]': node().data.status === 'error'
         }">
      
      <!-- Ports for connections -->
      <ng-diagram-port id="port-left" side="left" type="both" class="absolute -left-1 top-1/2 -translate-y-1/2" />
      <ng-diagram-port id="port-right" side="right" type="both" class="absolute -right-1 top-1/2 -translate-y-1/2" />

      <!-- Winner star icon -->
      @if (node().data.status === 'winner') {
        <div class="absolute -top-2 -right-2 bg-[#2C2C2E] border border-[#30D158] rounded-full p-1 text-[#30D158] flex items-center justify-center">
          <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">star</span>
        </div>
      }
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2 text-white">
          <span class="material-symbols-outlined text-[20px] transition-colors duration-500"
                [ngClass]="{
                  'text-[#8E8E93]': node().data.status === 'idle',
                  'text-[#0A84FF]': node().data.status === 'processing',
                  'text-[#30D158]': node().data.status === 'healthy',
                  'text-[#FF453A]': node().data.status === 'error'
                }">{{ node().data.icon }}</span>
          <span class="font-headline-sm text-sm font-semibold">{{ node().data.label }}</span>
        </div>
        <div class="w-2 h-2 rounded-full transition-colors duration-500"
             [ngClass]="{
               'bg-[#636366]': node().data.status === 'idle',
               'bg-[#0A84FF] animate-pulse': node().data.status === 'processing',
               'bg-[#30D158]': node().data.status === 'healthy',
               'bg-[#FF453A] animate-pulse': node().data.status === 'error'
             }"></div>
      </div>
      
      <p class="font-caption text-xs text-[#8E8E93] leading-relaxed">{{ node().data.description }}</p>
      
      <div class="mt-auto flex justify-between items-center pt-3 border-t border-[#38383A]/50">
        <div class="font-label-mono text-[10px] px-2 py-0.5 rounded font-mono transition-colors duration-500"
             [ngClass]="{
               'text-[#636366] bg-[#2C2C2E]': node().data.status === 'idle',
               'text-[#0A84FF] bg-[#0A84FF]/10': node().data.status === 'processing',
               'text-[#30D158] bg-[#30D158]/10': node().data.status === 'healthy',
               'text-[#FF453A] bg-[#FF453A]/10': node().data.status === 'error'
             }">
          {{ node().data.metric }}
        </div>
        @if (node().data.ownerImage) {
          <img [src]="node().data.ownerImage" [alt]="node().data.label + ' owner avatar'" class="w-6 h-6 rounded-full border border-[#38383A] object-cover" />
        }
      </div>
    </div>
  `
})
export class GiggsNodeComponent implements NgDiagramNodeTemplate<GiggsNodeData> {
  node = input.required<SimpleNode<GiggsNodeData>>();
}

/* ---------------------------------------------------------------------------
 * Custom Edge Template Component
 * --------------------------------------------------------------------------- */
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

/* ---------------------------------------------------------------------------
 * Main Page Component
 * --------------------------------------------------------------------------- */
@Component({
  selector: 'app-topology-page',
  imports: [
    CommonModule,
    NgDiagramComponent,
  ],
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
      <!-- Diagram Canvas -->
      <div class="relative w-full bg-[#131315] border border-[#38383A] rounded-xl overflow-hidden">
        <div class="diagram-container">
          <ng-diagram
            [model]="model()"
            [nodeTemplateMap]="nodeTemplates"
            [edgeTemplateMap]="edgeTemplates"
          />
        </div>
      </div>
      
      <!-- Log Panel -->
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
        <div class="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs leading-6" #logContainer>
          <div *ngIf="pipeline.logs().length === 0" class="text-[#636366] italic py-4">
            Waiting for pipeline execution... Submit a prompt from the Workbench to begin.
          </div>
          <div *ngFor="let log of pipeline.logs()" class="flex gap-3">
            <span class="text-[#636366] shrink-0">{{ log.timestamp }}</span>
            <span class="shrink-0 w-[70px]"
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
      height: 420px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopologyPage {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  pipeline = inject(PipelineService);
  
  private baseNodes = signal<any[]>([]);
  private baseEdges = signal<any[]>([]);

  nodeTemplates = new Map<string, Type<NgDiagramNodeTemplate<GiggsNodeData>>>([
    ['giggsNode', GiggsNodeComponent]
  ]);

  edgeTemplates = new Map<string, Type<NgDiagramEdgeTemplate<GiggsEdgeData>>>([
    ['custom', CustomEdgeComponent]
  ]);

  /** Reactive model updated via effect */
  model = signal<any>(initializeModel({ nodes: [], edges: [] }));

  constructor() {
    // Fetch base topology layout from API
    this.http.get<{nodes: any[], edges: any[]}>('topology').subscribe({
      next: (data) => {
        this.baseNodes.set(data.nodes);
        this.baseEdges.set(data.edges);
      },
      error: (err) => {
        console.error('Failed to load topology', err);
      }
    });

    // Rebuild the diagram model whenever stage or base data changes
    effect(() => {
      const currentStage = this.pipeline.stage();
      const currentIdx = stageIndex(currentStage);
      const nodes = this.baseNodes();
      const edges = this.baseEdges();
      
      if (nodes.length === 0) return;

      // Update node statuses based on pipeline stage
      const updatedNodes = nodes.map(node => {
        const nodeStage = NODE_STAGE_MAP[node.id];
        const nodeIdx = nodeStage ? stageIndex(nodeStage) : -1;
        
        let status = 'idle';
        let metric = 'IDLE';
        
        if (currentStage === 'idle') {
          status = 'idle';
          metric = 'IDLE';
        } else if (currentStage === 'error') {
          if (nodeIdx < currentIdx) {
            status = 'healthy';
            metric = 'DONE';
          } else if (nodeIdx === currentIdx) {
            status = 'error';
            metric = 'ERROR';
          }
        } else if (nodeIdx < currentIdx) {
          status = 'healthy';
          metric = 'DONE';
        } else if (nodeIdx === currentIdx) {
          status = 'processing';
          metric = 'ACTIVE';
        } else {
          status = 'idle';
          metric = 'PENDING';
        }

        return {
          ...node,
          size: { width: 240, height: 140 },
          autoSize: false,
          data: { ...node.data, status, metric }
        };
      });

      // Update edge statuses
      const updatedEdges = edges.map(edge => {
        const edgeTargetStage = EDGE_TARGET_STAGE[edge.id];
        const edgeTargetIdx = edgeTargetStage ? stageIndex(edgeTargetStage) : -1;
        
        let status = 'default';
        if (currentStage !== 'idle') {
          if (edgeTargetIdx < currentIdx) {
            status = 'done';
          } else if (edgeTargetIdx === currentIdx) {
            status = 'active';
          }
        }

        return { ...edge, data: { ...edge.data, status } };
      });

      // initializeModel requires an injection context
      runInInjectionContext(this.injector, () => {
        this.model.set(initializeModel({ nodes: updatedNodes, edges: updatedEdges }));
      });
    });
  }
}
