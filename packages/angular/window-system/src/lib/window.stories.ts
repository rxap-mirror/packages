import {
  Component,
  NgModule,
  TemplateRef,
} from '@angular/core';
import {
  moduleMetadata,
  Story,
} from '@storybook/angular';
import { WindowService } from './window.service';

@Component({
  template:
    `
        <div class="container">
            <button mat-raised-button (click)="openWindow(windowContent)">Open</button>
        </div>
        <ng-template #windowContent>
            <h1>Window Content</h1>
        </ng-template>
    `,
  styles: [
    `
        .container {
            padding: 32px;
            border: 0.5px solid lightgray;
        }
    `,
  ],
})
class WindowSystemPlaygroundComponent {

  constructor(private readonly windowService: WindowService) {
  }

  openWindow(windowContent: TemplateRef<any>) {
    this.windowService.open({
      template: windowContent,
      title: 'Playground',
    });
  }
}

@NgModule({
  declarations: [WindowSystemPlaygroundComponent],
  imports: [
    RxapWindowSystemModule,
  ],
  exports: [WindowSystemPlaygroundComponent],
})
class WindowSystemPlaygroundModule {
}

export default {
  title: 'WindowSystemPlaygroundComponent',
  component: WindowSystemPlaygroundComponent,
  decorators: [
    moduleMetadata({
      imports: [
        WindowSystemPlaygroundModule,
      ],
      providers: [],
    }),
  ],
};

const Template: Story<WindowSystemPlaygroundComponent> = (args: any) => ({
  props: args,
});

export const Default = Template.bind({});
