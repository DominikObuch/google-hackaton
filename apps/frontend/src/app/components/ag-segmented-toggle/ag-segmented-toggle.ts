import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ag-segmented-toggle',
  imports: [CommonModule],
  template: `
    <div class="bg-[#2C2C2E] border border-[#38383A] rounded-lg p-0.5 flex relative inline-flex select-none">
      <!-- Background Slider -->
      <div class="absolute top-0.5 bottom-0.5 bg-[#38383A] rounded-md shadow-sm transition-all duration-200"
           [style.width.px]="buttonWidth"
           [style.transform]="'translateX(' + (selectedIndex * buttonWidth) + 'px)'"></div>
      
      <!-- Option Buttons -->
      <button *ngFor="let option of options; let i = index"
              (click)="selectOption(i)"
              [style.width.px]="buttonWidth"
              class="px-4 py-1.5 text-sm text-center z-10 transition-colors duration-150 outline-none focus:outline-none"
              [class.text-white]="i === selectedIndex"
              [class.text-[#8E8E93]]="i !== selectedIndex"
              [class.hover:text-white]="i !== selectedIndex">
        {{ option }}
      </button>
    </div>
  `
})
export class AgSegmentedToggle {
  @Input() options: string[] = [];
  @Input() selectedIndex = 0;
  @Input() buttonWidth = 160; // Default width of each segment button in pixels
  @Output() selectionChange = new EventEmitter<number>();

  selectOption(index: number) {
    this.selectedIndex = index;
    this.selectionChange.emit(index);
  }
}
