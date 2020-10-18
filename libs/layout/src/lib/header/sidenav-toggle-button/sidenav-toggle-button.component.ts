import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Required } from '@rxap/utilities';

@Component({
  selector:        'rxap-sidenav-toggle-button',
  templateUrl:     './sidenav-toggle-button.component.html',
  styleUrls:       [ './sidenav-toggle-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sidenav-toggle-button' }
})
export class SidenavToggleButtonComponent {

  @Input()
  @Required
  public sidenav!: MatSidenav;

}
