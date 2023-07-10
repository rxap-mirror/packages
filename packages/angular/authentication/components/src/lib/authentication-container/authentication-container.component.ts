import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'rxap-authentication-container',
  templateUrl: './authentication-container.component.html',
  styleUrls: ['./authentication-container.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition(':enter', [
        style({opacity: 0}),
        animate('512ms', style({opacity: 1})),
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('512ms', style({opacity: 0})),
      ]),
    ]),
  ],
  standalone: true,
  imports: [RouterOutlet],
})
export class AuthenticationContainerComponent {

  public prepareRoute(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : 'true';
  }

}
