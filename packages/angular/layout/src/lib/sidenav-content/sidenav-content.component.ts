import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavContentComponentService } from './sidenav-content.component.service';
import { RouterOutlet } from '@angular/router';
import {
  AsyncPipe,
  NgClass,
  NgStyle,
} from '@angular/common';

@Component({
  selector: 'rxap-sidenav-content',
  templateUrl: './sidenav-content.component.html',
  styleUrls: [ './sidenav-content.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ NgClass, NgStyle, RouterOutlet, AsyncPipe ],
})
export class SidenavContentComponent {

  @Input() @Required public sidenav!: MatSidenav;

  constructor(public readonly sccs: SidenavContentComponentService) {
  }
}
