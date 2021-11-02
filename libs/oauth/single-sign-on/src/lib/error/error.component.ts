import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

@Component({
  selector:        'rxap-error',
  templateUrl:     './error.component.html',
  styleUrls:       [ './error.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-error' },
  animations:      [
    trigger('fadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [ style({ opacity: 0 }), animate(300) ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave', animate(300, style({ opacity: 0 })))
    ])
  ]
})
export class ErrorComponent {

  public get topLevelDomain() {
    const match = location.hostname.match(/([^.]+\.[^.]+$)/);
    if (match) {
      return match[ 0 ];
    } else {
      return location.hostname;
    }
  }

  public get mainApplicationUrl() {
    return `${location.protocol}//${this.topLevelDomain}`;
  }

}
