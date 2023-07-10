import { text } from '@storybook/addon-knobs';
import {
  componentWrapperDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { UploadButtonComponent } from './upload-button.component';
import { UploadButtonComponentModule } from './upload-button.component.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
  title: 'UploadButtonComponent',
  component: UploadButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        UploadButtonComponentModule,
        BrowserAnimationsModule,
      ],
    }),
    componentWrapperDecorator((story) => `<div style="margin: 3em">${ story }</div>`),
  ],
};

export const Default = () => ({
  props: {
    accept: text('accept', '**/**'),
  },
});
