import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ag-input',
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AgInput),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-2 w-full">
      <label *ngIf="label" class="font-caption text-xs text-[#8E8E93] uppercase tracking-wider">{{ label }}</label>
      <div class="bg-[#2C2C2E] border border-[#38383A] rounded-lg p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus-within:border-[#0A84FF] transition-colors">
        <textarea *ngIf="type === 'textarea'; else inputTemplate"
                  [(ngModel)]="value"
                  (ngModelChange)="onModelChange($event)"
                  (blur)="onTouched()"
                  [placeholder]="placeholder"
                  [rows]="rows"
                  class="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white resize-none placeholder-[#636366] font-body-md text-sm p-0 m-0"></textarea>
        <ng-template #inputTemplate>
          <input [type]="type"
                 [(ngModel)]="value"
                 (ngModelChange)="onModelChange($event)"
                 (blur)="onTouched()"
                 [placeholder]="placeholder"
                 class="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white placeholder-[#636366] font-body-md text-sm p-0 m-0" />
        </ng-template>
      </div>
    </div>
  `
})
export class AgInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'textarea' | 'password' | 'email' | 'number' = 'text';
  @Input() rows = 4;

  value = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: string): void {
    this.value = val || '';
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onModelChange(val: string): void {
    this.value = val;
    this.onChange(val);
  }
}
