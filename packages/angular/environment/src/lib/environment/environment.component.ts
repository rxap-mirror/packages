import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {RXAP_ENVIRONMENT} from './tokens';
import {Environment} from '../environment';
import {DatePipe, NgIf} from '@angular/common';

@Component({
  selector: 'rxap-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {class: 'rxap-environment'},
  standalone: true,
  imports: [NgIf, DatePipe],
})
export class EnvironmentComponent {

  public show = false;

  constructor(
    @Inject(RXAP_ENVIRONMENT)
    public readonly environment: Environment,
  ) {
  }

}
