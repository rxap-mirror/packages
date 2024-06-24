import {
  NavigationService,
  ProvideNavigationConfig,
} from '@rxap/layout';
import {
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { RXAP_NAVIGATION_CONFIG_INSERTS } from '../tokens';
import { NavigationComponent } from './navigation.component';

const meta: Meta<NavigationComponent> = {
  component: NavigationComponent,
  title: 'NavigationComponent',
  decorators: [
    moduleMetadata({
      providers: [
        NavigationService,
        ProvideNavigationConfig([
            {
              routerLink: [ '/', 'link-1' ],
              label: 'Link1',
              icon: { icon: 'volume_down' },
              children: [
                {
                  routerLink: [ '/', 'link-1', 'sub-1' ],
                  label: 'Sub1',
                  icon: { icon: 'hourglass_top' },
                  children: [
                    {
                      routerLink: [ '/', 'link-1', 'sub-1', 'sub-sub-1' ],
                      label: 'Sub1',
                      icon: { icon: 'hourglass_top' },
                      children: [
                        {
                          routerLink: [ '/', 'link-1', 'sub-1', 'sub-sub-1', 'sub-sub-sub-1' ],
                          label: 'Sub1',
                          icon: { icon: 'hourglass_top' },
                        },
                        {
                          routerLink: [ '/', 'link-1', 'sub-1', 'sub-sub-1', 'sub-sub-sub-2' ],
                          label: 'Sub2',
                          icon: { icon: 'cloud_download' },
                        },
                        {
                          routerLink: [ '/', 'link-1', 'sub-1', 'sub-sub-1', 'sub-sub-sub-3' ],
                          label: 'Sub3',
                          icon: { icon: 'power_settings_new' },
                        },
                      ],
                    },
                    {
                      routerLink: [ '/', 'link-1', 'sub-1', 'sub-sub-2' ],
                      label: 'Sub2',
                      icon: { icon: 'cloud_download' },
                    },
                    {
                      routerLink: [ '/', 'link-1', 'sub-1', 'sub-sub-3' ],
                      label: 'Sub3',
                      icon: { icon: 'power_settings_new' },
                    },
                  ],
                },
                {
                  routerLink: [ '/', 'link-1', 'sub-2' ],
                  label: 'Sub2',
                  icon: { icon: 'cloud_download' },
                },
                {
                  routerLink: [ '/', 'link-1', 'sub-3' ],
                  label: 'Sub3',
                  icon: { icon: 'power_settings_new' },
                },
              ],
            },
            {
              divider: true,
              title: 'My Title Divider Item',
            },
            {
              routerLink: [ '/', 'link-2' ],
              label: 'Looooooooooooooooog',
              icon: { icon: 'donut_small' },
            },
            {
              routerLink: [ '/', 'link-3' ],
              label: 'Link2',
              icon: { icon: 'donut_small' },
            },
            {
              routerLink: [ '/', 'link-4' ],
              label: 'Link3',
              icon: { icon: 'event' },
              children: [
                {
                  routerLink: [ '/', 'link-4', 'sub-1' ],
                  label: 'Sub1',
                  icon: { icon: 'alarm_on' },
                },
                {
                  routerLink: [ '/', 'link-4', 'sub-2' ],
                  label: 'Sub2',
                  icon: { icon: 'thumb_down' },
                },
                {
                  routerLink: [ '/', 'link-4', 'sub-3' ],
                  label: 'Sub3',
                  icon: { icon: 'trending_down' },
                },
              ],
            },
            {
              routerLink: [ '/', 'link-5' ],
              label: 'Link4',
              icon: { icon: 'important_devices' },
            },
          ]),
        {
          provide: RXAP_NAVIGATION_CONFIG_INSERTS,
          useValue: {
            'test': [
              {
                label: 'Insert Test',
                routerLink: [ '/' ],
                icon: {
                  icon: 'hourglass_top',
                },
              },
            ],
          },
        },
      ],
    })
  ],
};
export default meta;
type Story = StoryObj<NavigationComponent>;

export const Primary: Story = {
  args: {
    root: true,
  },
};
