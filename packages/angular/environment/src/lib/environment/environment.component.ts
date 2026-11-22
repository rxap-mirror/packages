import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Showcase } from '@ng-prism/core';
import { Environment } from '../environment';
import { RXAP_ENVIRONMENT } from './tokens';

@Showcase({
  title: 'Environment',
  category: 'Environment',
  description: 'Shows the build information of the running app. The values are read from the `RXAP_ENVIRONMENT` token, which the styleguide host provides with demo data.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-environment',
    templateUrl: './environment.component.html',
    styleUrls: ['./environment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  
    host: { class: 'rxap-environment' },
    imports: [DatePipe]
})
export class EnvironmentComponent {

  public readonly environment: Environment = inject(RXAP_ENVIRONMENT);

}
