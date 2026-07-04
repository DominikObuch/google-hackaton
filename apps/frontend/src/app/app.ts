import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex bg-background text-text-primary font-body-md">
      <!-- SideNavBar -->
      <nav class="bg-surface-container-low h-full w-64 fixed left-0 top-0 border-r border-border flex flex-col p-stack-lg z-50">
        <div class="mb-10">
          <h1 class="font-headline-md text-xl font-semibold text-text-primary mb-1">Giggs</h1>
          <p class="font-label-mono text-xs text-text-muted font-medium">[World #1 problem solving platform]</p>
        </div>

        <ul class="flex flex-col gap-2 flex-grow">
          <li>
            <a routerLink="/matrix"
               routerLinkActive="bg-surface-container-high text-apple-blue border-apple-blue font-semibold"
               class="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all rounded-lg font-body-md text-sm border border-transparent">
              <span class="material-symbols-outlined text-[20px]">tune</span>
              Parameters
            </a>
          </li>
          <li>
            <a routerLink="/workbench"
               routerLinkActive="bg-surface-container-high text-apple-blue border-apple-blue font-semibold"
               class="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all rounded-lg font-body-md text-sm border border-transparent">
              <span class="material-symbols-outlined text-[20px]">psychology</span>
              TRIZ Engine
            </a>
          </li>
          <li>
            <a routerLink="/topology"
               routerLinkActive="bg-surface-container-high text-apple-blue border-apple-blue font-semibold"
               class="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all rounded-lg font-body-md text-sm border border-transparent">
              <span class="material-symbols-outlined text-[20px]">outbound</span>
              E-Waste Flow
            </a>
          </li>
          <li>
            <a routerLink="/arena"
               routerLinkActive="bg-surface-container-high text-apple-blue border-apple-blue font-semibold"
               class="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all rounded-lg font-body-md text-sm border border-transparent">
              <span class="material-symbols-outlined text-[20px]">eco</span>
              Lifecycle
            </a>
          </li>
          <li>
            <a routerLink="/users"
               routerLinkActive="bg-surface-container-high text-apple-blue border-apple-blue font-semibold"
               class="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all rounded-lg font-body-md text-sm border border-transparent">
              <span class="material-symbols-outlined text-[20px]">people</span>
              Users Admin
            </a>
          </li>
          <li>
            <a routerLink="/settings"
               routerLinkActive="bg-surface-container-high text-apple-blue border-apple-blue font-semibold"
               class="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all rounded-lg font-body-md text-sm border border-transparent">
              <span class="material-symbols-outlined text-[20px]">settings</span>
              Settings
            </a>
          </li>
        </ul>

        <div class="mt-auto pt-6 border-t border-border flex flex-col gap-4">
          <a routerLink="/workbench" class="w-full bg-apple-blue text-white py-2.5 px-4 rounded-lg font-body-md text-sm font-medium hover:opacity-90 transition-opacity flex justify-between items-center group">
            <span>New Session</span>
            <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
          <ul class="flex flex-col gap-1">
            <li>
              <a class="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-text-primary transition-colors font-body-md text-xs" href="#">
                <span class="material-symbols-outlined text-[18px]">description</span>
                Docs
              </a>
            </li>
            <li>
              <a class="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-text-primary transition-colors font-body-md text-xs" href="#">
                <span class="material-symbols-outlined text-[18px]">help</span>
                Support
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Container -->
      <div class="ml-64 flex-1 min-h-screen flex flex-col">
        <router-outlet />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
