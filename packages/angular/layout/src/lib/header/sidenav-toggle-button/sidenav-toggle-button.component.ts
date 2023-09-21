import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutComponentService } from '../../layout/layout.component.service';

@Component({
  selector: 'rxap-sidenav-toggle-button',
  templateUrl: './sidenav-toggle-button.component.html',
  styleUrls: [ './sidenav-toggle-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    MatIconModule,
  ],
})
export class SidenavToggleButtonComponent {

  public readonly opened: Signal<boolean>;

  constructor(public readonly layoutComponentService: LayoutComponentService) {
    this.opened = toSignal(layoutComponentService.opened$, { initialValue: layoutComponentService.opened$.value });
  }

}
