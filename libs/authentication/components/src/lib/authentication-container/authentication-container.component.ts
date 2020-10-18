import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  style,
  trigger,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector:    'rxap-authentication-container',
  templateUrl: './authentication-container.component.html',
  styleUrls:   [ './authentication-container.component.scss' ],
  host:        { class: 'rxap-authentication-container' },
  animations:  [
    trigger('routeAnimations', [
      transition(
        ':enter',
        [
          style({ opacity: 0 }),
          animate('512ms', style({ opacity: 1 }))
        ]
      ),
      transition(
        ':leave',
        [
          style({ opacity: 1 }),
          animate('512ms', style({ opacity: 0 }))
        ]
      )
    ])
  ]
})
export class AuthenticationContainerComponent {

  public prepareRoute(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : 'true';
  }

}
