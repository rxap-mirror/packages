import {
  AsyncPipe,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatDrawerMode,
  MatSidenav,
  MatSidenavModule,
} from '@angular/material/sidenav';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  DetermineReleaseName,
  Environment,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import { IconLoaderService } from '@rxap/icon';
import { StatusIndicatorComponent } from '@rxap/ngx-status-check';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { LayoutComponentService } from './layout.component.service';


@Component({
  selector: 'rxap-layout',
  templateUrl: './layout.component.html',
  styleUrls: [ './layout.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    MatSidenavModule,
    AsyncPipe,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgIf,
    FooterComponent,
    MatMenuModule,
    NgOptimizedImage,
    NavigationComponent,
    RouterOutlet,
    StatusIndicatorComponent,
  ],
})
export class LayoutComponent {

  public sidenavMode: MatDrawerMode = 'over';

  @ViewChild(MatSidenav, { static: true }) public sidenav!: MatSidenav;

  constructor(
    public readonly layoutComponentService: LayoutComponentService,
    @Inject(RXAP_ENVIRONMENT)
    private readonly environment: Environment,
    iconLoaderService: IconLoaderService,
  ) {
    iconLoaderService.load();
  }

  public get release() {
    return DetermineReleaseName(this.environment);
  }

  public toggleSidenavMode() {
    if (this.sidenavMode === 'over') {
      this.sidenavMode = 'side';
      this.sidenav.open();
    } else {
      this.sidenavMode = 'over';
    }
  }
}
