import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { LanguageSelectorComponentModule } from './language-selector.component.module';
import { LanguageSelectorComponent } from './language-selector.component';

addDecorator(moduleMetadata({
  imports: [
    LanguageSelectorComponentModule,
  ],
}));

export default {
  title: 'LanguageSelectorComponent',
  component: LanguageSelectorComponent,
};

export const basic = () => ({
  component: LanguageSelectorComponent,
  props: {},
});
