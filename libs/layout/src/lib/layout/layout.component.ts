import {
  Component,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { LayoutComponentService } from './layout.component.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector:        'rxap-layout',
  templateUrl:     './layout.component.html',
  styleUrls:       [ './layout.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {

  public openWindowSidenav = false;

  @ViewChild(MatSidenav, { static: true }) public sidenav!: MatSidenav;

  constructor(
    public readonly layoutComponentService: LayoutComponentService,
  ) { }

}
