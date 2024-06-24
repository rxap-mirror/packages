import {
  NgClass,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  Signal,
  viewChild,
} from '@angular/core';
import {
  MatButton,
  MatIconButton,
} from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatDrawerMode,
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../layout.service';
import { NavigationComponent } from '../navigation/navigation.component';
import { SidenavFooterDirective } from './sidenav-footer.directive';
import { SidenavHeaderDirective } from './sidenav-header.directive';

@Component({
  selector: 'rxap-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: [ './sidenav.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    NavigationComponent,
    NgIf,
    RouterOutlet,
    NgClass,
    NgStyle,
    MatDivider,
    NgTemplateOutlet,
    MatButton,
  ],
})
export class SidenavComponent {

  private readonly layoutService = inject(LayoutService);


  private readonly sidenav = viewChild(MatSidenav);

  public readonly sidenavMode: Signal<MatDrawerMode> = computed(() => this.layoutService.mode());
  public readonly fixedBottomGap: Signal<number> = computed(() => this.layoutService.fixedBottomGap());
  public readonly fixedTopGap: Signal<number> = computed(() => this.layoutService.fixedTopGap());
  public readonly fixedInViewport: Signal<boolean> = computed(() => this.layoutService.fixedInViewport());
  public readonly pinned: Signal<boolean> = computed(() => this.layoutService.pinned());
  public readonly collapsed: Signal<boolean> = computed(() => this.layoutService.collapsed());
  public readonly collapsable: Signal<boolean> = computed(() => this.layoutService.collapsable());
  public readonly opened: Signal<boolean> = computed(() => this.layoutService.opened());
  public readonly sidenavFooterDirective = contentChild(SidenavFooterDirective);
  public readonly sidenavHeaderDirective = contentChild(SidenavHeaderDirective);

  togglePinned() {
    this.layoutService.togglePinned();
  }

  async openSidenav() {
    await this.sidenav()?.open();
    this.layoutService.openSidenav();
  }

  async closeSidenav() {
    await this.sidenav()?.close();
    this.layoutService.closeSidenav();
  }

}
