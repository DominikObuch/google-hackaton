import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'button[ag-button], a[ag-button]',
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': '"px-6 py-2.5 font-medium transition-all duration-150 inline-flex items-center justify-center gap-2 " + getVariantClasses()',
    '[attr.disabled]': 'disabled ? "" : null',
  }
})
export class AgButton {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input({ transform: booleanAttribute }) disabled = false;

  getVariantClasses() {
    if (this.disabled) {
      return 'bg-[#2A2A2C] text-[#636366] cursor-not-allowed opacity-50 border border-[#38383A] rounded-lg';
    }
    switch (this.variant) {
      case 'secondary':
        return 'bg-[#2A2A2C] hover:bg-[#353437] text-white border border-[#38383A] rounded-lg';
      case 'ghost':
        return 'bg-transparent hover:bg-[#353437] text-[#8E8E93] hover:text-white border border-[#38383A] rounded-lg';
      case 'primary':
      default:
        return 'bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white rounded-lg shadow-lg shadow-[#0A84FF]/10';
    }
  }
}
