import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { User as UserModel } from '@workspace/http';
import { UserContainerService } from './user-container.service';

@Component({
  selector: 'app-user-container',
  template: `<p>User container works! ({{ users().length }} users loaded)</p>`,
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
