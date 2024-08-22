import { Component, TemplateRef } from '@angular/core';
import { Story } from '@storybook/angular';
import { WindowService } from './window.service';

@Component({
  template: `
    <div>
      <button mat-raised-button (click)="openWindow(windowContent)">
        Open
      </button>
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
  standalone: true,
})
class WindowSystemPlaygroundComponent {
  constructor(private readonly windowService: WindowService) {}

  openWindow(windowContent: TemplateRef<any>) {
    this.windowService.open({
      template: windowContent,
      title: 'Playground',
    });
  }
}
export default {
  title: 'WindowSystemPlaygroundComponent',
  component: WindowSystemPlaygroundComponent,
};

const Template: Story<WindowSystemPlaygroundComponent> = (args: any) => ({
  props: args,
});

export const Default = Template.bind({});
