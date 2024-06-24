import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  MatAnchor,
  MatButton,
  MatIconButton,
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ExternalAppsService } from '../../external-apps.service';

@Component({
  selector: 'rxap-apps-button',
  templateUrl: './apps-button.component.html',
  styleUrls: [ './apps-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatButton,
    RouterLink,
    MatAnchor,
    MatIconButton,
    MatIcon,
  ],
})
export class AppsButtonComponent implements OnInit {
  /**
   * The signal that indicates if the app list is open
   */
  public readonly isOpen = signal(false);

  private readonly externalAppsService = inject(ExternalAppsService);
  public readonly appList = computed(() => this.externalAppsService.activeAppList());
  public readonly hasApps = computed(() => this.appList().length > 0);

  public toggle(): void {
    this.isOpen.update(isOpen => !isOpen);
  }

  public ngOnInit(): void {
    this.externalAppsService.getAppList();
  }

}
