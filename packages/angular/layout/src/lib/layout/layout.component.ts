import {
  AsyncPipe,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  public readonly sidenavMode: Signal<MatDrawerMode>;
  public readonly fixedBottomGap: Signal<number>;
  public readonly fixedTopGap: Signal<number>;
  public readonly pinned: Signal<boolean>;
  public readonly collapsable: Signal<boolean>;
  public readonly logoSrc: string;
  public readonly logoWidth: number;
  public readonly release: string;
  public readonly opened: Signal<boolean>;

  @ViewChild(MatSidenav, { static: true }) public sidenav!: MatSidenav;

  constructor(
    public readonly layoutComponentService: LayoutComponentService,
    @Inject(RXAP_ENVIRONMENT)
    private readonly environment: Environment,
    iconLoaderService: IconLoaderService,
  ) {
    iconLoaderService.load();
    this.fixedBottomGap = toSignal(layoutComponentService.fixedBottomGap$, { initialValue: 0 });
    this.fixedTopGap =
      toSignal(layoutComponentService.fixedTopGap$, { initialValue: layoutComponentService.fixedTopGap$.value });
    this.sidenavMode = toSignal(layoutComponentService.mode$, { initialValue: layoutComponentService.mode$.value });
    this.pinned = toSignal(layoutComponentService.pinned$, { initialValue: layoutComponentService.pinned$.value });
    this.collapsable =
      toSignal(layoutComponentService.collapsable$, { initialValue: layoutComponentService.collapsable$.value });
    this.opened = toSignal(layoutComponentService.opened$, { initialValue: layoutComponentService.opened$.value });
    this.logoSrc = this.layoutComponentService.logo.src ?? 'https://via.placeholder.com/256x128px';
    this.logoWidth = this.layoutComponentService.logo.width ?? 256;
    this.release = DetermineReleaseName(this.environment);
  }

}
