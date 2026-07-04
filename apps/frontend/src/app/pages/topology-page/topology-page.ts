import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
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
import { AgSegmentedToggle } from '../../components/ag-segmented-toggle/ag-segmented-toggle';

/* ---------------------------------------------------------------------------
 * Custom Node Template Component
 * --------------------------------------------------------------------------- */
@Component({
  selector: 'app-giggs-node',
  imports: [CommonModule, NgDiagramPortComponent],
  template: `
    <div class="relative bg-[#2C2C2E]/90 border rounded-xl p-4 w-[240px] flex flex-col gap-3 transition-all duration-200 hover:border-[#636366] text-white shadow-xl"
         [ngClass]="{
           'border-[#38383A]': node().data.status === 'healthy',
           'border-[#30D158] shadow-[inset_0_0_0_1px_#30D158]': node().data.status === 'winner',
           'border-[#FF453A] shadow-[inset_0_0_0_1px_#FF453A]': node().data.status === 'error'
         }">
      
      <!-- Ports for connections -->
      <ng-diagram-port id="port-left" side="left" type="both" class="absolute -left-1 top-1/2 -translate-y-1/2" />
      <ng-diagram-port id="port-right" side="right" type="both" class="absolute -right-1 top-1/2 -translate-y-1/2" />

      <!-- Winner star icon -->
      <div *ngIf="node().data.status === 'winner'" class="absolute -top-2 -right-2 bg-[#2C2C2E] border border-[#30D158] rounded-full p-1 text-[#30D158] flex items-center justify-center">
        <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">star</span>
      </div>

      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2 text-white">
          <span class="material-symbols-outlined text-[#8E8E93] text-[20px]">{{ node().data.icon }}</span>
          <span class="font-headline-sm text-sm font-semibold">{{ node().data.label }}</span>
        </div>
        <div class="w-2 h-2 rounded-full"
             [ngClass]="{
               'bg-[#30D158]': node().data.status !== 'error',
               'bg-[#FF453A] animate-pulse': node().data.status === 'error'
             }"></div>
      </div>
      
      <p class="font-caption text-xs text-[#8E8E93] leading-relaxed">{{ node().data.description }}</p>
      
      <div class="mt-2 flex justify-between items-center pt-3 border-t border-[#38383A]/50">
        <div class="font-label-mono text-[10px] px-2 py-0.5 rounded font-mono"
             [ngClass]="{
               'text-[#0A84FF] bg-[#0A84FF]/10': node().data.status === 'healthy' && node().data.metricColor === 'blue',
               'text-[#30D158] bg-[#30D158]/10': node().data.status === 'winner',
               'text-[#FF453A] bg-[#FF453A]/10': node().data.status === 'error',
               'text-[#8E8E93] bg-[#2C2C2E]': !node().data.metricColor
             }">
          {{ node().data.metric }}
        </div>
        <img *ngIf="node().data.ownerImage" [src]="node().data.ownerImage" class="w-6 h-6 rounded-full border border-[#38383A] object-cover" />
      </div>
    </div>
  `
})
export class GiggsNodeComponent implements NgDiagramNodeTemplate {
  node = input.required<SimpleNode<any>>();
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
export class CustomEdgeComponent implements NgDiagramEdgeTemplate {
  edge = input.required<Edge<any>>();

  getStrokeColor() {
    const status = this.edge().data?.status;
    if (status === 'active') return '#0A84FF';
    if (status === 'error') return '#FF453A';
    return '#38383A';
  }

  getStrokeWidth() {
    const status = this.edge().data?.status;
    if (status === 'active') return 3;
    if (status === 'error') return 3;
    return 2.5;
  }

  getStrokeDasharray() {
    const status = this.edge().data?.status;
    if (status === 'active') return '6 6';
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
    AgSegmentedToggle,
  ],
  providers: [provideNgDiagram()],
  template: `
    <header class="mb-8 flex justify-between items-end px-10 pt-6">
      <div>
        <h1 class="font-display-lg text-2xl font-bold text-white mb-2">System Topology</h1>
        <p class="text-sm text-[#8E8E93]">Live architectural view of the E-Waste processing pipeline.</p>
      </div>
      
      <ag-segmented-toggle
        [options]="['Topology', 'Team View']"
        [selectedIndex]="selectedView()"
        (selectionChange)="selectedView.set($event)"
        [buttonWidth]="120" />
    </header>

    <main class="flex-1 px-10 pb-10">
      <!-- Diagram Canvas -->
      <div class="relative w-full bg-[#131315] border border-[#38383A] rounded-xl overflow-hidden min-h-[600px] flex">
        <ng-diagram
          [model]="model"
          [nodeTemplateMap]="nodeTemplates"
          [edgeTemplateMap]="edgeTemplates"
          class="w-full h-[600px]"
        />
        
        <!-- Live Details Overlay -->
        <div class="absolute bottom-8 right-8 w-[320px] bg-[#2C2C2E] border border-[#38383A] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-5 z-50">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-headline-sm text-sm font-semibold text-white">Giggs Live Health</h3>
            <button class="text-[#636366] hover:text-white"><span class="material-symbols-outlined text-sm">close</span></button>
          </div>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-[#8E8E93]">Overall Efficiency</span>
                <span class="text-[#30D158]">94%</span>
              </div>
              <div class="h-1.5 w-full bg-[#131315] rounded-full overflow-hidden">
                <div class="h-full bg-[#30D158] w-[94%]"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-[#8E8E93]">Cache Memory Pressure</span>
                <span class="text-[#FF453A]">99%</span>
              </div>
              <div class="h-1.5 w-full bg-[#131315] rounded-full overflow-hidden">
                <div class="h-full bg-[#FF453A] w-[99%]"></div>
              </div>
            </div>
          </div>
          <button class="w-full mt-6 bg-transparent border border-[#38383A] text-white font-body-md text-xs py-2 rounded-lg hover:bg-[#353437] transition-colors">
            View Live Logs
          </button>
        </div>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopologyPage {
  selectedView = signal(0);

  nodeTemplates = new Map<string, any>([
    ['giggsNode', GiggsNodeComponent]
  ]);

  edgeTemplates = new Map<string, any>([
    ['custom', CustomEdgeComponent]
  ]);

  model = initializeModel({
    nodes: [
      {
        id: 'node-ingest-1',
        type: 'giggsNode',
        position: { x: 50, y: 50 },
        data: {
          label: 'IoT Aggregator',
          icon: 'sensors',
          description: 'Edge collection from sorting facilities.',
          status: 'healthy',
          metric: 'CPU: 12%',
          metricColor: 'blue',
          ownerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSxd57OVO6cp1VNQDmVarAn9NRzo-9m9cJqbbiBuqav4zFWhFDvkVorcWS_n7aCo9tx3cnN5R6V6X1aLm7x7qyxDy4BGxtr4f007NhngyMkOHvVUBXauXb2AbqRIzAq8wPkBszzpoaTdz002YitVMjXQTPkPYhKOuPTgtyR1yPF2fRB69lgkWn2Py4uV6GB1iW_7GTkrdJhoeu1zWeHwRv4_dZsw93Xe_lRuifcVjm3hmXgkxjtdkB5B1x_nBStpZbTtV5YzXWMX6R'
        }
      },
      {
        id: 'node-ingest-2',
        type: 'giggsNode',
        position: { x: 50, y: 350 },
        data: {
          label: 'Partner API Gateway',
          icon: 'api',
          description: 'External data ingestion from logistics.',
          status: 'healthy',
          metric: 'REQ: 1.2k/s',
          ownerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRc6ACOD2EZ-n_fEmtgclk89HvP6ShW4nCZEml2EbZ4eaWNxXowt8kLcOJ4bpK21NFWdAfH5lnTvArXsC24uJrMUwgHadSTRxvuDtw__VayVOlNVtDb82yjeQl0R1yWuQqQZCPSRWCBfjJXucdvm8ak0DWiJ0wRUHXUdmgP9_3lw37y7Z3RGTPJZFj72DhZld_Hm99T7eQB4Bqs19PL_MBchU0QsLqTC4rbr26wwASY8BP5ntYBUjWZOG3PgMb9vnmjsO-V-pAExRQ'
        }
      },
      {
        id: 'node-process-1',
        type: 'giggsNode',
        position: { x: 380, y: 200 },
        data: {
          label: 'Material Classifier',
          icon: 'psychology',
          description: 'ML inference for rare-earth metal detection.',
          status: 'winner',
          metric: 'GPU: 94%',
          ownerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqquBhC4HX3KdhYSn2bL9-2v8c1YRVBszF1oiLRaPioLket-71hxcwUjF9l60AAD6fU-J-gb0G40p-AR6YtoFk48RNjmsQyzB2zSjMdMPK1Q93MpVTfQHiLXx-IeP7EJW2iG1a3vRgc4QB8O2MC1gN3dS81eemBdaAGJE5UQMAGwDSa7URX1ck0Fzfy0FrHSEWyTu1ZZiAzTicSk27kR1UFpFojWV0BuKOy0-lDB6eaBK7PFH_kJVeOpuFLeBhOJbG8EhGrx6VMizj'
        }
      },
      {
        id: 'node-store-1',
        type: 'giggsNode',
        position: { x: 710, y: 50 },
        data: {
          label: 'Primary Lakehouse',
          icon: 'database',
          description: 'Immutable ledger of extracted materials.',
          status: 'healthy',
          metric: 'IOPS: 4.5k'
        }
      },
      {
        id: 'node-store-2',
        type: 'giggsNode',
        position: { x: 710, y: 350 },
        data: {
          label: 'Analytics Cache',
          icon: 'warning',
          description: 'High memory pressure. Eviction rate > 80%.',
          status: 'error',
          metric: 'MEM: 99%',
          ownerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfPllS2gGoyHPcgIs4ggDmmlxixuANp6hp2rlqKB7sCt3LNHrNgXw_LPLQCbPQNW7WiRqSynWIpPurWz58NOsYFMJYd-KokXnCe0XK73JEKp7J_Ka-bN22bFCy-bG55EAJZtn038Je4werJ18OEjYtwNEajJM5X-l5OqLhdtTjvuOZOfpboSMtr9lp7BTI3Ziq6jkwqBh1SKNkmcdpshH6obEG8DWcaGZUrdbHtn8Vv8ZHyR3fv8bfTB1xar9eROu86HrBrSOwSSJZ'
        }
      },
      {
        id: 'node-deliver-1',
        type: 'giggsNode',
        position: { x: 1040, y: 200 },
        data: {
          label: 'Client Portal UI',
          icon: 'dashboard',
          description: 'Real-time recovery metrics dashboard.',
          status: 'healthy',
          metric: 'LAT: 45ms'
        }
      }
    ],
    edges: [
      {
        id: 'link-1',
        type: 'custom',
        source: 'node-ingest-1',
        target: 'node-process-1',
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: { status: 'active' }
      },
      {
        id: 'link-2',
        type: 'custom',
        source: 'node-ingest-2',
        target: 'node-process-1',
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: { status: 'active' }
      },
      {
        id: 'link-3',
        type: 'custom',
        source: 'node-process-1',
        target: 'node-store-1',
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: { status: 'default' }
      },
      {
        id: 'link-4',
        type: 'custom',
        source: 'node-process-1',
        target: 'node-store-2',
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: { status: 'error' }
      },
      {
        id: 'link-5',
        type: 'custom',
        source: 'node-store-1',
        target: 'node-deliver-1',
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: { status: 'default' }
      },
      {
        id: 'link-6',
        type: 'custom',
        source: 'node-store-2',
        target: 'node-deliver-1',
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: { status: 'default' }
      }
    ]
  });
}
