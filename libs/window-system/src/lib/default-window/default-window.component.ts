import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector:        'rxap-default-window',
  templateUrl:     './default-window.component.html',
  styleUrls:       [ './default-window.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultWindowComponent {}
