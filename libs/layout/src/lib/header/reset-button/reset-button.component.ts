import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { ResetService } from '@rxap/services';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector:        'rxap-reset-button',
  templateUrl:     './reset-button.component.html',
  styleUrls:       [ './reset-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-reset-button' },
  standalone:      true,
  imports:         [ MatButtonModule, MatIconModule ]
})
export class ResetButtonComponent {
  constructor(
    @Inject(ResetService)
    public readonly resetService: ResetService
  ) {}
}
