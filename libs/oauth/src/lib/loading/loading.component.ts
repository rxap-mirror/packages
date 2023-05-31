import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { MatLegacyProgressBarModule } from '@angular/material/legacy-progress-bar';

@Component({
  selector:        'rxap-loading',
  templateUrl:     './loading.component.html',
  styleUrls:       [ './loading.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-loading' },
  standalone:      true,
  imports:         [ MatLegacyProgressBarModule ]
})
export class LoadingComponent {
}
