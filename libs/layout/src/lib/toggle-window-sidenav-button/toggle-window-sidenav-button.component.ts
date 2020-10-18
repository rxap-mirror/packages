import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector:        'rxap-toggle-window-sidenav-button',
  templateUrl:     './toggle-window-sidenav-button.component.html',
  styleUrls:       [ './toggle-window-sidenav-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            {
    class: 'rxap-toggle-window-sidenav-button'
  }
})
export class ToggleWindowSidenavButtonComponent implements OnInit {

  @Input()
  public openWindowSidenav = false;

  @Output()
  public openWindowSidenavChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  public toggle() {
    this.openWindowSidenav = !this.openWindowSidenav;
    this.openWindowSidenavChange.emit(this.openWindowSidenav);
  }

}
