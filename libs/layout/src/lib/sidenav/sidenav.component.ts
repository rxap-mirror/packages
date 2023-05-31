import {
  Component,
  ChangeDetectionStrategy,
  ContentChild
} from '@angular/core';
import { SidenavFooterDirective } from './sidenav-footer.directive';
import { SidenavHeaderDirective } from './sidenav-header.directive';
import { SidenavComponentService } from './sidenav.component.service';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { NavigationComponent } from '../navigation/navigation.component';
import { MatDividerModule } from '@angular/material/divider';
import { FlexModule } from '@angular/flex-layout/flex';
import {
  NgClass,
  NgIf,
  NgTemplateOutlet,
  AsyncPipe
} from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';

@Component({
  selector:        'rxap-sidenav',
  templateUrl:     './sidenav.component.html',
  styleUrls:       [ './sidenav.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            {
    class: 'rxap-layout-sidenav'
  },
  standalone:      true,
  imports:         [
    ExtendedModule,
    NgClass,
    FlexModule,
    NgIf,
    NgTemplateOutlet,
    MatDividerModule,
    NavigationComponent,
    MatLegacyButtonModule,
    MatIconModule,
    AsyncPipe
  ]
})
export class SidenavComponent {

  @ContentChild(SidenavFooterDirective)
  public sidenavFooterDirective?: SidenavFooterDirective;

  @ContentChild(SidenavHeaderDirective)
  public sidenavHeaderDirective?: SidenavHeaderDirective;

  constructor(public readonly sidenav: SidenavComponentService) {}

}
