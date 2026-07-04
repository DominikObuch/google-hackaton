import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ag-badge',
  imports: [CommonModule],
  template: `
    <span class="px-2.5 py-1 rounded-full font-mono text-xs border transition-all duration-150 inline-flex items-center"
          [ngClass]="getThemeClasses()">
      <ng-content></ng-content>
    </span>
  `
})
export class AgBadge {
  @Input() theme: 'primary' | 'muted' | 'success' | 'warning' | 'error' = 'primary';

  getThemeClasses() {
    switch (this.theme) {
      case 'muted':
        return 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A]';
      case 'success':
        return 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30';
      case 'warning':
        return 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/30';
      case 'error':
        return 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/30';
      case 'primary':
      default:
        return 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20';
    }
  }
}
