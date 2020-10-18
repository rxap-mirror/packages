import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { RXAP_ENVIRONMENT } from './tokens';
import { Environment } from '../environment';

@Component({
  selector:        'rxap-environment',
  templateUrl:     './environment.component.html',
  styleUrls:       [ './environment.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-environment' }
})
export class EnvironmentComponent {

  constructor(
    @Inject(RXAP_ENVIRONMENT)
    public readonly environment: Environment
  ) {}

}
