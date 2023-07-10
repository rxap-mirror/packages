import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
} from '@angular/core';
import { SidenavFooterDirective } from './sidenav-footer.directive';
import { SidenavHeaderDirective } from './sidenav-header.directive';
import { SidenavComponentService } from './sidenav.component.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationComponent } from '../navigation/navigation.component';
import { MatDividerModule } from '@angular/material/divider';
import { FlexModule } from '@angular/flex-layout/flex';
import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';

@Component({
  selector: 'rxap-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'rxap-layout-sidenav',
  },
  standalone: true,
  imports: [
    ExtendedModule,
    NgClass,
    FlexModule,
    NgIf,
    NgTemplateOutlet,
    MatDividerModule,
    NavigationComponent,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
  ],
})
export class SidenavComponent {

  @ContentChild(SidenavFooterDirective)
  public sidenavFooterDirective?: SidenavFooterDirective;

  @ContentChild(SidenavHeaderDirective)
  public sidenavHeaderDirective?: SidenavHeaderDirective;

  constructor(public readonly sidenav: SidenavComponentService) {
  }

}
