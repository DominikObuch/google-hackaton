import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User as UserModel } from '@workspace/http';
import { UserContainerService } from './user-container.service';
import { AgCard } from '../../components/ag-card/ag-card';
import { AgBadge } from '../../components/ag-badge/ag-badge';
import { AgButton } from '../../components/ag-button/ag-button';

@Component({
  selector: 'app-user-container',
  standalone: true,
  imports: [CommonModule, AgCard, AgBadge],
  template: `
    <div class="px-10 py-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
      <header class="flex justify-between items-center pb-4 border-b border-[#38383A]">
        <div>
          <h2 class="font-display-lg text-2xl font-bold text-white mb-2">Users Administration</h2>
          <p class="text-sm text-[#8E8E93]">Manage system administrators and operator accounts.</p>
        </div>
      </header>

      <ag-card>
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-headline-sm text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#8E8E93]">people</span>
            Active Operators ({{ users().length }})
          </h3>
          <ag-badge theme="primary">Sync Connected</ag-badge>
        </div>

        <div *ngIf="loading()" class="flex flex-col items-center justify-center py-12 gap-3">
          <span class="material-symbols-outlined animate-spin text-[#0A84FF] text-3xl">hourglass_empty</span>
          <span class="text-sm text-[#8E8E93]">Loading users...</span>
        </div>

        <div *ngIf="!loading()" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm text-[#8E8E93]">
            <thead>
              <tr class="border-b border-[#38383A] text-xs font-mono uppercase tracking-wider text-white">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Email Address</th>
                <th class="py-3 px-4">Birth Year</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users()" class="border-b border-[#38383A]/50 hover:bg-white/5 transition-colors">
                <td class="py-3 px-4 font-mono text-white">#{{ u.id }}</td>
                <td class="py-3 px-4 text-white font-medium">{{ u.name }} {{ u.surname }}</td>
                <td class="py-3 px-4 font-mono">{{ u.email }}</td>
                <td class="py-3 px-4">{{ u.birthYear }}</td>
                <td class="py-3 px-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button class="px-3 py-1 bg-[#2C2C2E] border border-[#38383A] hover:bg-[#353437] text-white text-xs rounded-lg transition-colors flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                    </button>
                    <button class="px-3 py-1 bg-[#FF453A]/10 border border-[#FF453A]/30 hover:bg-[#FF453A]/20 text-[#FF453A] text-xs rounded-lg transition-colors flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">delete</span> Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users().length === 0">
                <td colspan="5" class="py-12 text-center text-[#636366]">No users found in database.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ag-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserContainerService],
})
export class UserContainer implements OnInit {
  private readonly service = inject(UserContainerService);

  protected readonly users = this.service.users;
  protected readonly loading = this.service.loading;
  protected readonly editing = signal<UserModel | null>(null);

  ngOnInit(): void {
    this.service.load();
  }
}
