import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { RXAP_ENVIRONMENT } from './tokens';
import { Environment } from '../environment';
import {
  NgIf,
  DatePipe
} from '@angular/common';

@Component({
  selector:        'rxap-environment',
  templateUrl:     './environment.component.html',
  styleUrls:       [ './environment.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-environment' },
  standalone:      true,
  imports:         [ NgIf, DatePipe ]
})
export class EnvironmentComponent {

  public show = false;

  constructor(
    @Inject(RXAP_ENVIRONMENT)
    public readonly environment: Environment
  ) {}

}
