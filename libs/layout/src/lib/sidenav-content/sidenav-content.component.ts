import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavContentComponentService } from './sidenav-content.component.service';

@Component({
  selector:        'rxap-sidenav-content',
  templateUrl:     './sidenav-content.component.html',
  styleUrls:       [ './sidenav-content.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavContentComponent implements OnInit {

  @Input() @Required public sidenav!: MatSidenav;

  constructor(public readonly sccs: SidenavContentComponentService) { }

  ngOnInit() {
  }

}
