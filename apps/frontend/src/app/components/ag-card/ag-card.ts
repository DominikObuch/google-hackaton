import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ag-card',
  imports: [CommonModule],
  template: `
    <div class="relative flex flex-col gap-4 p-6 bg-[#2C2C2E]/80 backdrop-blur border rounded-xl transition-all duration-200"
         [ngClass]="{
           'border-[#30D158]': winner,
           'border-[#38383A]': !winner,
           'hover:border-[#636366] cursor-pointer': interactive
         }">
      <!-- Star Icon overlay for winner -->
      @if (winner) {
        <div class="absolute top-4 right-4 bg-[#30D158]/20 text-[#30D158] rounded-full p-1.5 flex items-center justify-center">
          <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1; font-size: 16px;">star</span>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class AgCard {
  @Input({ transform: booleanAttribute }) winner = false;
  @Input({ transform: booleanAttribute }) interactive = false;
}
