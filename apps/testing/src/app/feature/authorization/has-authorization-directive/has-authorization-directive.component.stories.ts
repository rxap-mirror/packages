import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { HasAuthorizationDirectiveComponentModule } from './has-authorization-directive.component.module';
import { HasAuthorizationDirectiveComponent } from './has-authorization-directive.component';

addDecorator(moduleMetadata({
  imports: [
    HasAuthorizationDirectiveComponentModule
  ]
}));

export default {
  title:     'HasAuthorizationDirectiveComponent',
  component: HasAuthorizationDirectiveComponent
};

export const basic = () => ({
  component: HasAuthorizationDirectiveComponent,
  props:     {}
});
