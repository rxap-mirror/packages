import {
  NgFor,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ExternalAppsService } from '../../external-apps.service';

@Component({
  selector: 'rxap-apps-button',
  templateUrl: './apps-button.component.html',
  styleUrls: [ './apps-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    RouterLink,
  ],
})
export class AppsButtonComponent implements OnInit {
  /**
   * The signal that indicates if the app list is open
   */
  public readonly isOpen = signal(false);

  private readonly externalAppsService = inject(ExternalAppsService);
  public readonly appList = computed(() => this.externalAppsService.activeAppList());

  public toggle(): void {
    this.isOpen.update(isOpen => !isOpen);
  }

  public ngOnInit(): void {
    this.externalAppsService.getAppList();
  }

}
