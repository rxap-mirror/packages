import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IconDirective } from '@rxap/material-directives/icon';
import { IconConfig } from '@rxap/utilities';
import { Meta } from '@storybook/angular';

@Component({
  selector: 'rxap-test-component',
  template: '<mat-icon [rxapIcon]="icon()"></mat-icon>',
  standalone: true,
  imports: [MatIcon, IconDirective],
})
class TestComponent {
  icon = input.required<IconConfig | null>();
}

export default {
  title: 'IconDirective',
  component: TestComponent,
} as Meta<TestComponent>;

export const StringInput = {
  args: {
    icon: 'delete',
  },
};

export const MaterialInput = {
  args: {
    icon: {
      icon: 'visibility',
    },
  },
};

export const SvgInput = {
  args: {
    icon: {
      svgIcon: 'view-dashboard',
    },
  },
};

export const Empty = {
  args: {
    icon: null,
  },
};
