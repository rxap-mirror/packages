import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector:        'rxap-sign-out',
  templateUrl:     './sign-out.component.html',
  styleUrls:       [ './sign-out.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sign-out' }
})
export class SignOutComponent { }
