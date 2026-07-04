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
      @if (label) {
        <label [attr.for]="inputId" class="font-caption text-xs text-[#8E8E93] uppercase tracking-wider">{{ label }}</label>
      }
      <div class="bg-[#2C2C2E] border border-[#38383A] rounded-lg p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus-within:border-[#0A84FF] transition-colors">
        @if (type === 'textarea') {
          <textarea [id]="inputId"
                    [(ngModel)]="value"
                    (ngModelChange)="onModelChange($event)"
                    (blur)="onTouched()"
                    [placeholder]="placeholder"
                    [rows]="rows"
                    class="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white resize-none placeholder-[#636366] font-body-md text-sm p-0 m-0"></textarea>
        } @else {
          <input [id]="inputId"
                 [type]="type"
                 [(ngModel)]="value"
                 (ngModelChange)="onModelChange($event)"
                 (blur)="onTouched()"
                 [placeholder]="placeholder"
                 class="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white placeholder-[#636366] font-body-md text-sm p-0 m-0" />
        }
      </div>
    </div>
  `
})
export class AgInput implements ControlValueAccessor {
  private static idCounter = 0;

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'textarea' | 'password' | 'email' | 'number' = 'text';
  @Input() rows = 4;

  readonly inputId = `ag-input-${AgInput.idCounter++}`;

  value = '';

  onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(val: string): void {
    this.value = val || '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onModelChange(val: string): void {
    this.value = val;
    this.onChange(val);
  }
}
