import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgOptimizedImage,
  NgStyle,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { LogoService } from '../logo.service';
import { NavigationProgressBarComponent } from '../navigation-progress-bar/navigation-progress-bar.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { ReleaseInfoComponent } from '../release-info/release-info.component';
import { SidenavFooterDirective } from '../sidenav/sidenav-footer.directive';
import { SidenavComponent } from '../sidenav/sidenav.component';


@Component({
    selector: 'rxap-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        HeaderComponent,
        MatSidenavModule,
        AsyncPipe,
        MatIconModule,
        MatButtonModule,
        RouterLink,
        NgIf,
        FooterComponent,
        MatMenuModule,
        NgOptimizedImage,
        NavigationComponent,
        RouterOutlet,
        NgStyle,
        NgClass,
        SidenavComponent,
        ReleaseInfoComponent,
        SidenavFooterDirective,
        NavigationProgressBarComponent,
    ]
})
export class LayoutComponent {

  protected readonly logoService = inject(LogoService);
  public readonly logoSrc: Signal<string> = computed(() => this.logoService.src());
  public readonly logoWidth: Signal<number> = computed(() => this.logoService.width());
  public readonly logoHeight: Signal<number> = computed(() => this.logoService.height());

}
