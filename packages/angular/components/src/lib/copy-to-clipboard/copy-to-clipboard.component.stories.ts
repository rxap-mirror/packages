import { MatIcon } from '@angular/material/icon';
import { CopyToClipboardComponent } from './copy-to-clipboard.component';
import {
  Meta,
  argsToTemplate,
  moduleMetadata,
} from '@storybook/angular';

export default {
  title: 'CopyToClipboardComponent',
  component: CopyToClipboardComponent,
} as Meta<CopyToClipboardComponent>;

export const Primary = {
  render: (args: CopyToClipboardComponent) => ({
    props: args,
    template: `<rxap-copy-to-clipboard ${argsToTemplate(args)}></rxap-copy-to-clipboard>`,
  }),
  args: {
    value: 'test',
  },
};

export const WithIcon = {
  render: (args: CopyToClipboardComponent) => ({
    props: args,
    template: `<rxap-copy-to-clipboard ${argsToTemplate(args)}><mat-icon>qr_code</mat-icon>${args.value}</rxap-copy-to-clipboard>`,
  }),
  decorators: [
    moduleMetadata({
      imports: [
        MatIcon
      ]
    })
  ],
  args: {
    value: 'test',
    position: 'after'
  },
};

export const CustomContainerClass = {
  render: (args: CopyToClipboardComponent) => ({
    props: args,
    template: `<rxap-copy-to-clipboard ${argsToTemplate(args)}><mat-icon>qr_code</mat-icon>${args.value}</rxap-copy-to-clipboard>`,
  }),
  decorators: [
    moduleMetadata({
      imports: [
        MatIcon
      ]
    })
  ],
  args: {
    value: 'test',
    position: 'after',
    containerClass: 'flex flex-row gap-32'
  },
};
