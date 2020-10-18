import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector:        'rxap-root',
  templateUrl:     './app.component.html',
  styleUrls:       [ './app.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap' }
})
export class AppComponent {}
