import {
  Component,
  ChangeDetectionStrategy,
  ContentChild
} from '@angular/core';
import { SidenavFooterDirective } from './sidenav-footer.directive';
import { SidenavHeaderDirective } from './sidenav-header.directive';
import { SidenavComponentService } from './sidenav.component.service';

@Component({
  selector:        'rxap-sidenav',
  templateUrl:     './sidenav.component.html',
  styleUrls:       [ './sidenav.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            {
    class: 'rxap-layout-sidenav'
  }
})
export class SidenavComponent {

  @ContentChild(SidenavFooterDirective)
  public sidenavFooterDirective?: SidenavFooterDirective;

  @ContentChild(SidenavHeaderDirective)
  public sidenavHeaderDirective?: SidenavHeaderDirective;

  constructor(public readonly sidenav: SidenavComponentService) {}

}
