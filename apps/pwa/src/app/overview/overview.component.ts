import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector:        'rxap-overview',
  templateUrl:     './overview.component.html',
  styleUrls:       [ './overview.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-overview' }
})
export class OverviewComponent {}
