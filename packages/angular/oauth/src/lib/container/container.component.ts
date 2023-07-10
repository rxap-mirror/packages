import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'rxap-container',
  templateUrl: './container.component.html',
  styleUrls: [ './container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'rxap-container' },
  animations: [
    trigger('routeAnimations', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('512ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('512ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
  standalone: true,
  imports: [ RouterOutlet ],
})
export class ContainerComponent {

  public prepareRoute(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : 'true';
  }

}
