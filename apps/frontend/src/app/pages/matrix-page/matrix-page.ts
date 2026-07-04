import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrizHttp } from '@workspace/http';
import { AgBadge } from '../../components/ag-badge/ag-badge';
import { AgSegmentedToggle } from '../../components/ag-segmented-toggle/ag-segmented-toggle';

@Component({
  selector: 'app-matrix-page',
  imports: [
    CommonModule,
    AgBadge,
    AgSegmentedToggle,
  ],
  template: `
    <header class="flex justify-between items-end mb-6 border-b border-[#38383A] pb-4 px-10 pt-6">
      <div>
        <h2 class="font-display-lg text-2xl font-bold text-white mb-2">Contradiction Matrix</h2>
        <p class="text-sm text-[#8E8E93]">Resolving engineering conflicts via automated principle extraction.</p>
      </div>
      
      <ag-segmented-toggle
        [options]="['Visual Matrix', 'Logic Inspector']"
        [selectedIndex]="selectedView()"
        (selectionChange)="selectedView.set($event)"
        [buttonWidth]="140" />
    </header>

    <div class="flex flex-1 gap-6 px-10 pb-10 h-[calc(100vh-140px)]">
      <!-- LEFT COLUMN: Altshuller Matrix Segment -->
      <section class="bg-[#2C2C2E]/80 border border-[#38383A] rounded-xl flex flex-col overflow-hidden shadow-sm relative w-full flex-grow">
        <div class="p-4 border-b border-[#38383A] bg-[#2A2A2C] flex justify-between items-center z-20">
          <h3 class="font-headline-sm text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#8E8E93]">grid_view</span>
            Altshuller Matrix Segment
          </h3>
          <div class="flex gap-2">
            <ag-badge theme="primary">W: {{ selectedRowName() }}</ag-badge>
            <ag-badge theme="error">L: {{ selectedColName() }}</ag-badge>
          </div>
        </div>

        <div class="flex-1 overflow-auto bg-[#131315] p-4 relative" id="matrix-container">
          <div class="grid grid-cols-[200px_repeat(39,1fr)] gap-[1px] bg-[#38383A] border border-[#38383A] min-w-[2800px]">
            <!-- Top Header Corner -->
            <div class="bg-[#2A2A2C] p-2 flex items-end justify-end text-right sticky left-0 z-30">
              <span class="font-mono text-[9px] text-[#636366] leading-tight">Worsening →<br>↓ Improving</span>
            </div>
            
            <!-- Col Headers -->
            @for (col of cols; track col) {
              <div [attr.title]="getParameterName(col)"
                   class="bg-[#2A2A2C] p-2 text-center font-mono text-[10px] text-white font-medium border-b-2 border-[#FF453A] cursor-help">
                {{ col }}
              </div>
            }

            <!-- Matrix Rows -->
            @for (row of rows; track row.id) {
              <!-- Row Header -->
              <div class="bg-[#2A2A2C] p-2 font-mono text-[10px] text-white font-medium border-r border-[#38383A] sticky left-0 z-20">
                {{ row.id }}. {{ row.name }}
              </div>

              <!-- Cells -->
              @for (col of cols; track col) {
                <button type="button"
                     (click)="selectCell(row.id, col, row.name)"
                     [class.bg-[#0A84FF]/10]="selectedRow() === row.id || selectedCol() === col"
                     [class.border-[#0A84FF]]="selectedRow() === row.id && selectedCol() === col"
                     [class.active-intersection]="selectedRow() === row.id && selectedCol() === col"
                     class="appearance-none bg-[#2C2C2E] p-2 text-center text-[10px] text-white cursor-pointer hover:bg-white/5 transition-all flex items-center justify-center font-mono min-h-[40px] w-full">
                  <span [class.text-[#0A84FF]]="selectedRow() === row.id && selectedCol() === col"
                        [class.font-bold]="hasData(row.id, col)">
                    {{ getCellContent(row.id, col) }}
                  </span>
                </button>
              }
            }
          </div>
        </div>
      </section>
    </div>

    <!-- Details Overlay Modal -->
    @if (showModal()) {
    <div class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- Backdrop -->
      <button type="button" aria-label="Close modal" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity appearance-none cursor-default" (click)="closeModal()"></button>

      <!-- Modal Content -->
      <div class="bg-[#1C1C1E] border border-[#38383A] rounded-xl shadow-2xl w-full max-w-3xl mx-4 relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-5 border-b border-[#38383A]">
          <h4 class="font-headline-sm text-xl font-semibold text-white">Inventive Principles for [{{ selectedRow() }}, {{ selectedCol() }}]</h4>
          <button (click)="closeModal()" class="text-[#8E8E93] hover:text-white transition-colors">
            <span class="material-symbols-outlined block">close</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-grow flex flex-col gap-4">
          <div class="flex justify-between text-xs text-[#8E8E93] uppercase tracking-wider">
            <span>Improving: {{ selectedRowName() }}</span>
            <span>Worsening: {{ selectedColName() }}</span>
          </div>

          @if (loadingModal()) {
            <div class="flex flex-col items-center justify-center py-10 gap-3">
              <span class="material-symbols-outlined animate-spin text-[#0A84FF] text-3xl">hourglass_empty</span>
              <span class="text-sm text-[#8E8E93]">Querying TRIZ matrix...</span>
            </div>
          }

          @if (!loadingModal() && modalContent()) {
            <div class="bg-[#2C2C2E] border border-[#38383A] p-4 rounded-lg leading-relaxed text-base text-white font-mono whitespace-pre-wrap max-h-[500px] overflow-auto">
              {{ modalContent() }}
            </div>
          }
        </div>

        <div class="p-4 border-t border-[#38383A] bg-[#2A2A2C] flex justify-end">
          <button (click)="closeModal()" class="px-5 py-2 bg-[#38383A] hover:bg-[#353437] text-white text-sm rounded-lg font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .active-intersection {
      background-color: rgba(10, 132, 255, 0.2) !important;
      border: 1px solid #0A84FF !important;
      box-shadow: inset 0 0 0 1px #0A84FF !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixPage implements OnInit {
  private readonly trizHttp = inject(TrizHttp);

  ngOnInit() {
    this.trizHttp.getEntireMatrix().subscribe({
      next: (res) => {
        try {
          const loaded = JSON.parse(res.result);
          if (loaded && typeof loaded === 'object') {
            this.cellMap.set({ ...this.cellMap(), ...loaded });
          }
        } catch (e) {
          console.error('Failed to parse contradiction matrix', e);
        }
      }
    });
  }

  selectedView = signal(0);
  selectedRow = signal<number>(12); // Shape
  selectedCol = signal<number>(32); // Manufacturability
  selectedRowName = signal<string>('Shape');
  selectedColName = signal<string>('Manufacturability');

  showModal = signal(false);
  loadingModal = signal(false);
  modalContent = signal('');

  rows = [
    { id: 1, name: 'Weight of moving object' },
    { id: 2, name: 'Weight of stationary object' },
    { id: 3, name: 'Length of moving object' },
    { id: 4, name: 'Length of stationary object' },
    { id: 5, name: 'Area of moving object' },
    { id: 6, name: 'Area of stationary object' },
    { id: 7, name: 'Volume of moving object' },
    { id: 8, name: 'Volume of stationary object' },
    { id: 9, name: 'Speed' },
    { id: 10, name: 'Force' },
    { id: 11, name: 'Tension or pressure' },
    { id: 12, name: 'Shape' },
    { id: 13, name: 'Stability of object\'s composition' },
    { id: 14, name: 'Strength' },
    { id: 15, name: 'Durability of moving object' },
    { id: 16, name: 'Durability of stationary object' },
    { id: 17, name: 'Temperature' },
    { id: 18, name: 'Illumination intensity' },
    { id: 19, name: 'Use of energy by moving object' },
    { id: 20, name: 'Use of energy by stationary object' },
    { id: 21, name: 'Power' },
    { id: 22, name: 'Loss of energy' },
    { id: 23, name: 'Loss of substance' },
    { id: 24, name: 'Loss of information' },
    { id: 25, name: 'Loss of time' },
    { id: 26, name: 'Quantity of substance/matter' },
    { id: 27, name: 'Reliability' },
    { id: 28, name: 'Measurement accuracy' },
    { id: 29, name: 'Manufacturing precision' },
    { id: 30, name: 'Object-affected harmful factors' },
    { id: 31, name: 'Object-generated harmful factors' },
    { id: 32, name: 'Manufacturability' },
    { id: 33, name: 'Ease of operation' },
    { id: 34, name: 'Ease of repair' },
    { id: 35, name: 'Adaptability or versatility' },
    { id: 36, name: 'Device complexity' },
    { id: 37, name: 'Difficulty of detecting/measuring' },
    { id: 38, name: 'Extent of automation' },
    { id: 39, name: 'Productivity' }
  ];

  cols = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39
  ];

  // Full contradiction matrix map (populated dynamically from the backend)
  cellMap = signal<Record<string, string>>({
    '12-32': '35, 28',
    '12-26': '1, 4',
    '12-27': '22, 35',
    '12-29': '1, 4',
    '12-30': '22, 35',
    '12-33': '10, 34',
    '12-35': '1, 10',
    '1-27': '2, 35',
    '1-32': '1, 10',
    '2-27': '28, 35',
    '10-27': '3, 35',
    '10-32': '26, 35',
    '14-27': '3, 40',
    '14-32': '1, 28',
    '15-32': '35, 10',
    '27-32': '28, 35',
    '29-32': '1, 35',
  });

  hasData(row: number, col: number): boolean {
    return !!this.cellMap()[`${row}-${col}`];
  }

  getCellContent(row: number, col: number): string {
    return this.cellMap()[`${row}-${col}`] || '-';
  }

  getParameterName(id: number): string {
    const p = this.rows.find(r => r.id === id);
    return p ? p.name : `Parameter ${id}`;
  }

  selectCell(row: number, col: number, rowName: string) {
    this.selectedRow.set(row);
    this.selectedCol.set(col);
    this.selectedRowName.set(rowName);
    this.selectedColName.set(this.getParameterName(col));

    this.loadingModal.set(true);
    this.showModal.set(true);

    this.trizHttp.browseMatrix([row], [col]).subscribe({
      next: (res) => {
        this.modalContent.set(res.result);
        this.loadingModal.set(false);
      },
      error: () => {
        this.modalContent.set('Error querying contradiction matrix cell.');
        this.loadingModal.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.modalContent.set('');
  }
}
