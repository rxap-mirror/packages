import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Required } from '@rxap/utilities';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector:        'rxap-sidenav-toggle-button',
  templateUrl:     './sidenav-toggle-button.component.html',
  styleUrls:       [ './sidenav-toggle-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sidenav-toggle-button' },
  standalone:      true,
  imports:         [ MatLegacyButtonModule, NgIf, MatIconModule ]
})
export class SidenavToggleButtonComponent {

  @Input()
  @Required
  public sidenav!: MatSidenav;

}
