import { NavigationService } from '../navigation.service';
import {
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { ProvideNavigationConfig } from '../provide';
import { LayoutComponent } from './layout.component';

const meta: Meta<LayoutComponent> = {
  component: LayoutComponent,
  title: 'LayoutComponent',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      providers: [
        NavigationService,
        ProvideNavigationConfig([
          {
            routerLink: [],
            label: 'Link1',
            icon: { icon: 'volume_down' },
            children: [
              {
                routerLink: [ '/', 'sub-1' ],
                label: 'Sub1',
                icon: { icon: 'hourglass_top' },
                children: [
                  {
                    routerLink: [ '/', 'sub-1' ],
                    label: 'Sub1',
                    icon: { icon: 'hourglass_top' },
                    children: [
                      {
                        routerLink: [ '/', 'sub-1' ],
                        label: 'Sub1',
                        icon: { icon: 'hourglass_top' },
                      },
                      {
                        routerLink: [ '/', 'sub-2' ],
                        label: 'Sub2',
                        icon: { icon: 'cloud_download' },
                      },
                      {
                        routerLink: [ '/', 'sub-3' ],
                        label: 'Sub3',
                        icon: { icon: 'power_settings_new' },
                      },
                    ],
                  },
                  {
                    routerLink: [ '/', 'sub-2' ],
                    label: 'Sub2',
                    icon: { icon: 'cloud_download' },
                  },
                  {
                    routerLink: [ '/', 'sub-3' ],
                    label: 'Sub3',
                    icon: { icon: 'power_settings_new' },
                  },
                ],
              },
              {
                routerLink: [ '/', 'sub-2' ],
                label: 'Sub2',
                icon: { icon: 'cloud_download' },
              },
              {
                routerLink: [ '/', 'sub-3' ],
                label: 'Sub3',
                icon: { icon: 'power_settings_new' },
              },
            ],
          },
          {
            routerLink: [ '/', 'link-2' ],
            label: 'Looooooooooooooooog',
            icon: { icon: 'donut_small' },
          },
          {
            routerLink: [ '/', 'link-2' ],
            label: 'Link2',
            icon: { icon: 'donut_small' },
          },
          {
            routerLink: [ '/', 'link-3' ],
            label: 'Link3',
            icon: { icon: 'event' },
            children: [
              {
                routerLink: [ '/', 'link-3', 'sub-1' ],
                label: 'Sub1',
                icon: { icon: 'alarm_on' },
              },
              {
                routerLink: [ '/', 'link-3', 'sub-2' ],
                label: 'Sub2',
                icon: { icon: 'thumb_down' },
              },
              {
                routerLink: [ '/', 'link-3', 'sub-3' ],
                label: 'Sub3',
                icon: { icon: 'trending_down' },
              },
            ],
          },
          {
            routerLink: [ '/', 'link-4' ],
            label: 'Link4',
            icon: { icon: 'important_devices' },
          },
        ]),
      ],
    })
  ]
};
export default meta;
type Story = StoryObj<LayoutComponent>;

export const Primary: Story = {
  args: {},
};
