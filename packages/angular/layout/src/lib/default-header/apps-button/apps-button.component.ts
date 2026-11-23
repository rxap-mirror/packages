import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  MatAnchor,
  MatButton,
  MatIconButton,
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@rxap/material-directives/icon';
import { ExternalAppsService } from '../../external-apps.service';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Apps Button',
  category: 'Layout',
  description: 'Icon button that expands a list of links to the external apps. It is only rendered if at least one app is configured. The apps are provided with demo data by the styleguide host.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-apps-button',
    templateUrl: './apps-button.component.html',
    styleUrls: ['./apps-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgOptimizedImage,
        MatButton,
        RouterLink,
        MatAnchor,
        MatIconButton,
        MatIcon,
        IconDirective,
    ]
})
export class AppsButtonComponent {
  /**
   * The signal that indicates if the app list is open
   */
  public readonly isOpen = signal(false);

  protected readonly externalAppsService = inject(ExternalAppsService);
  public readonly appList = computed(() => this.externalAppsService.activeAppList());
  public readonly hasApps = computed(() => this.appList().length > 0);

  public toggle(): void {
    this.isOpen.update(isOpen => !isOpen);
  }

  constructor() {
    this.externalAppsService.getAppList();
  }

}
