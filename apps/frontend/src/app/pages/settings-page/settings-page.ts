import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleHttp, GoogleConnectionStatus } from '@workspace/http';
import { AgButton } from '../../components/ag-button/ag-button';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgInput } from '../../components/ag-input/ag-input';
import { AgBadge } from '../../components/ag-badge/ag-badge';

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    FormsModule,
    AgButton,
    AgCard,
    AgInput,
    AgBadge,
  ],
  template: `
    <header class="sticky top-0 z-50 bg-[#1C1C1E]/80 backdrop-blur-md border-b border-[#38383A] h-16">
      <div class="max-w-[1440px] mx-auto px-10 h-full flex items-center justify-between">
        <div class="flex items-baseline gap-3 w-1/4">
          <span class="font-headline-md text-lg font-semibold text-white">Giggs Settings</span>
          <span class="font-caption text-xs text-[#636366]">[SDG 12 E-Waste Engine]</span>
        </div>
      </div>
    </header>

    <main class="max-w-[1440px] mx-auto px-10 pt-6 flex flex-col gap-6">
      <!-- Title Section -->
      <section class="pb-4 border-b border-[#38383A]">
        <h2 class="font-display-lg text-2xl font-bold text-white mb-2">Google API Key Integration</h2>
        <p class="text-sm text-[#8E8E93]">Manage and test Google Gemini API credentials for the Giggs platform.</p>
      </section>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Environment Configuration Status -->
        <ag-card>
          <div class="flex justify-between items-center pb-2 border-b border-[#38383A]">
            <h3 class="font-headline-sm text-base font-semibold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[#8E8E93]">lan</span>
              Environment API Key Status
            </h3>
            <ag-badge [theme]="status().configured ? 'success' : 'error'">
              {{ status().configured ? 'Configured' : 'Not Configured' }}
            </ag-badge>
          </div>

          <div class="flex flex-col gap-4 mt-2">
            <p class="text-sm text-[#8E8E93] leading-relaxed">
              The application reads the Google Gemini API key from the environment variable
              <code class="font-mono text-white bg-[#1C1C1E] px-1.5 py-0.5 rounded text-xs">AI_STUDIO_API_KEY</code>.
            </p>

            <div class="bg-[#1C1C1E] p-4 rounded-lg border border-[#38383A] flex flex-col gap-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-[#8E8E93]">Configuration Source:</span>
                <span class="font-mono text-white bg-[#2C2C2E] px-1.5 py-0.5 rounded">.env / Process Env</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-[#8E8E93]">Verification Status:</span>
                <span class="font-semibold" [ngClass]="status().success ? 'text-[#30D158]' : 'text-[#FF453A]'">
                  {{ status().success ? 'Active & Ready' : 'Inactive / Untested' }}
                </span>
              </div>
              @if (status().model) {
                <div class="flex justify-between items-center text-xs">
                  <span class="text-[#8E8E93]">Resolved Model:</span>
                  <span class="font-mono text-[#0A84FF]">{{ status().model }}</span>
                </div>
              }
            </div>

            @if (status().message) {
              <div class="bg-[#30D158]/5 border border-[#30D158]/20 p-4 rounded-lg">
                <div class="flex gap-2 items-start">
                  <span class="material-symbols-outlined text-[#30D158] text-sm mt-0.5">check_circle</span>
                  <div>
                    <h4 class="font-semibold text-xs text-white">Gemini Response:</h4>
                    <p class="text-xs text-[#8E8E93] mt-1 italic leading-relaxed">"{{ status().message }}"</p>
                  </div>
                </div>
              </div>
            }

            @if (status().error) {
              <div class="bg-[#FF453A]/5 border border-[#FF453A]/20 p-4 rounded-lg">
                <div class="flex gap-2 items-start">
                  <span class="material-symbols-outlined text-[#FF453A] text-sm mt-0.5">error</span>
                  <div>
                    <h4 class="font-semibold text-xs text-white">Connection Error:</h4>
                    <p class="font-mono text-xs text-[#FF453A] mt-1 leading-relaxed">{{ status().error }}</p>
                  </div>
                </div>
              </div>
            }

            <button ag-button variant="primary" (click)="checkLiveStatus()" [disabled]="checking()">
              @if (checking()) {
                <span class="material-symbols-outlined text-sm">hourglass_empty</span>
              }
              {{ checking() ? 'Verifying...' : 'Check Connection' }}
              @if (!checking()) {
                <span class="material-symbols-outlined text-sm">sync</span>
              }
            </button>
          </div>
        </ag-card>

        <!-- Test Custom API Key Card -->
        <ag-card>
          <div class="pb-2 border-b border-[#38383A]">
            <h3 class="font-headline-sm text-base font-semibold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[#8E8E93]">vpn_key</span>
              Test Custom API Key
            </h3>
          </div>

          <div class="flex flex-col gap-4 mt-2">
            <p class="text-sm text-[#8E8E93] leading-relaxed">
              Verify the validity of a custom Google Gemini API key before saving it to your environment files.
            </p>

            <ag-input
              type="password"
              label="Google API Key"
              placeholder="Paste AI_STUDIO_API_KEY (AI Studio / Gemini API Key)..."
              [(ngModel)]="customKey" />

            @if (customStatus().success) {
              <div class="bg-[#30D158]/5 border border-[#30D158]/20 p-4 rounded-lg flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#30D158] text-sm">check_circle</span>
                  <span class="text-xs font-semibold text-white">Key Validation Succeeded</span>
                </div>
                @if (customStatus().message) {
                  <p class="text-xs text-[#8E8E93] leading-relaxed italic">
                    "{{ customStatus().message }}"
                  </p>
                }
              </div>
            }

            @if (customStatus().error) {
              <div class="bg-[#FF453A]/5 border border-[#FF453A]/20 p-4 rounded-lg flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#FF453A] text-sm">error</span>
                  <span class="text-xs font-semibold text-white">Key Validation Failed</span>
                </div>
                <p class="font-mono text-xs text-[#FF453A] leading-relaxed">
                  {{ customStatus().error }}
                </p>
              </div>
            }

            <div class="flex gap-2">
              <button ag-button variant="secondary" (click)="validateCustomKey()" [disabled]="testing() || !customKey().trim()" class="flex-1">
                @if (testing()) {
                  <span class="material-symbols-outlined text-sm">hourglass_empty</span>
                }
                {{ testing() ? 'Validating...' : 'Validate Key' }}
              </button>
              <button ag-button variant="ghost" (click)="clearCustomTest()" [disabled]="testing() || (!customKey().trim() && !customStatus().error && !customStatus().success)">
                Clear
              </button>
            </div>
          </div>
        </ag-card>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage implements OnInit {
  private readonly googleHttp = inject(GoogleHttp);

  status = signal<GoogleConnectionStatus>({
    success: false,
    configured: false,
  });

  customStatus = signal<GoogleConnectionStatus>({
    success: false,
    configured: false,
  });

  checking = signal(false);
  testing = signal(false);
  customKey = signal('');

  ngOnInit(): void {
    // Perform initial checks of environment configuration status
    this.checkLiveStatus();
  }

  checkLiveStatus(): void {
    this.checking.set(true);
    this.googleHttp.getStatus().subscribe({
      next: (res) => {
        this.status.set(res);
        this.checking.set(false);
      },
      error: (err) => {
        this.status.set({
          success: false,
          configured: false,
          error: err.error?.message || err.message || 'Failed to contact backend status service.',
        });
        this.checking.set(false);
      },
    });
  }

  validateCustomKey(): void {
    const key = this.customKey().trim();
    if (!key) return;

    this.testing.set(true);
    this.googleHttp.testConnection(key).subscribe({
      next: (res) => {
        this.customStatus.set(res);
        this.testing.set(false);
      },
      error: (err) => {
        this.customStatus.set({
          success: false,
          configured: true,
          error: err.error?.message || err.message || 'Key validation failed due to system/network error.',
        });
        this.testing.set(false);
      },
    });
  }

  clearCustomTest(): void {
    this.customKey.set('');
    this.customStatus.set({
      success: false,
      configured: false,
    });
  }
}
