import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rxap-toggle-window-sidenav-button',
  templateUrl: './toggle-window-sidenav-button.component.html',
  styleUrls: [ './toggle-window-sidenav-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'rxap-toggle-window-sidenav-button',
  },
  standalone: true,
  imports: [MatButtonModule, NgIf, MatIconModule],
})
export class ToggleWindowSidenavButtonComponent {

  @Input()
  public openWindowSidenav = false;

  @Output()
  public openWindowSidenavChange = new EventEmitter<boolean>();

  public toggle() {
    this.openWindowSidenav = !this.openWindowSidenav;
    this.openWindowSidenavChange.emit(this.openWindowSidenav);
  }

}
