import {
  DatePipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Environment } from '../environment';
import { RXAP_ENVIRONMENT } from './tokens';

@Component({
    selector: 'rxap-environment',
    templateUrl: './environment.component.html',
    styleUrls: ['./environment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  
    host: { class: 'rxap-environment' },
    imports: [NgIf, DatePipe]
})
export class EnvironmentComponent {

  public readonly environment: Environment = inject(RXAP_ENVIRONMENT);

}
