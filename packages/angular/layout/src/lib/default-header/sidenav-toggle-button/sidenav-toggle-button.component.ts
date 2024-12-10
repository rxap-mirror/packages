import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LayoutService } from '../../layout.service';

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

  private readonly layoutComponentService = inject(LayoutService);

  public readonly opened = computed(() => this.layoutComponentService.opened());

  public toggle() {
    this.layoutComponentService.toggleOpened();
  }

}
