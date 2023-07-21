import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import {
  MatDrawerMode,
  MatSidenav,
  MatSidenavModule,
} from '@angular/material/sidenav';
import {
  DetermineReleaseName,
  Environment,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import { HeaderComponent } from '../header/header.component';
import {
  AsyncPipe,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponentService } from './layout.component.service';
import { NavigationComponent } from '../navigation/navigation.component';


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
  ],
})
export class LayoutComponent {

  public sidenavMode: MatDrawerMode = 'over';

  @ViewChild(MatSidenav, { static: true }) public sidenav!: MatSidenav;

  constructor(
    public readonly layoutComponentService: LayoutComponentService,
    @Inject(RXAP_ENVIRONMENT)
    private readonly environment: Environment,
  ) {}

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
