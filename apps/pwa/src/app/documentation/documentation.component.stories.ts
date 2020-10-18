import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { DocumentationComponentModule } from './documentation.component.module';
import { DocumentationComponent } from './documentation.component';

addDecorator(moduleMetadata({
  imports: [
    DocumentationComponentModule
  ]
}));

export default {
  title:     'DocumentationComponent',
  component: DocumentationComponent
};

export const basic = () => ({
  component: DocumentationComponent,
  props:     {}
});
