import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
} from '@angular/core';
import { LayoutComponentService } from './layout.component.service';
import {
  MatSidenav,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { AsyncPipe } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { WindowContainerSidenavComponent } from '../window-container-sidenav/window-container-sidenav.component';
import { ToggleWindowSidenavButtonComponent } from '../toggle-window-sidenav-button/toggle-window-sidenav-button.component';
import { SidenavContentComponent } from '../sidenav-content/sidenav-content.component';
import { RouterLink } from '@angular/router';
import { SidenavHeaderDirective } from '../sidenav/sidenav-header.directive';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'rxap-layout',
  templateUrl: './layout.component.html',
  styleUrls: [ './layout.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    MatSidenavModule,
    SidenavComponent,
    SidenavHeaderDirective,
    RouterLink,
    SidenavContentComponent,
    ToggleWindowSidenavButtonComponent,
    WindowContainerSidenavComponent,
    FooterComponent,
    AsyncPipe,
  ],
})
export class LayoutComponent {

  public openWindowSidenav = false;

  @ViewChild(MatSidenav, {static: true}) public sidenav!: MatSidenav;

  constructor(
    public readonly layoutComponentService: LayoutComponentService,
  ) {
  }

}
