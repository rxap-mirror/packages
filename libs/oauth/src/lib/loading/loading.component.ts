import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

@Component({
  selector:        'rxap-loading',
  templateUrl:     './loading.component.html',
  styleUrls:       [ './loading.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-loading' }
})
export class LoadingComponent {
}
