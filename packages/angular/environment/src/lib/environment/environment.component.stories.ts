import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { EnvironmentComponentModule } from './environment.component.module';
import { EnvironmentComponent } from './environment.component';
import { RXAP_ENVIRONMENT } from './tokens';
import { Environment } from '../environment';
import '@angular/localize/init';

const environment: Environment = {
  name: 'production',
  production: true,
  master: false,
  development: false,
  stable: false,
  staging: false,
  local: false,
  serviceWorker: true,
  e2e: false,
  mergeRequest: true,
  release: null,
  commit: null,
  timestamp: new Date().toISOString(),
  branch: null,
  tag: null,
};

addDecorator(moduleMetadata({
  imports: [
    EnvironmentComponentModule,
  ],
  providers: [
    {
      provide: RXAP_ENVIRONMENT,
      useValue: environment,
    },
  ],
}));

export default {
  title: 'EnvironmentComponent',
  component: EnvironmentComponent,
};

export const basic = () => ({
  props: {},
});
