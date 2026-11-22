import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LayoutService } from '../../layout.service';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Sidenav Toggle Button',
  category: 'Layout',
  description: 'Icon button in the default header that opens and closes the sidenav of the layout through the `LayoutService`.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-sidenav-toggle-button',
    templateUrl: './sidenav-toggle-button.component.html',
    styleUrls: ['./sidenav-toggle-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatIcon,
        MatIconButton,
    ]
})
export class SidenavToggleButtonComponent {

  protected readonly layoutComponentService = inject(LayoutService);

  public readonly opened = computed(() => this.layoutComponentService.opened());

  public toggle() {
    this.layoutComponentService.toggleOpened();
  }

}
