import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Required } from '@rxap/utilities';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

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

  @Input({ required: true })
  public sidenav!: MatSidenav;

}
