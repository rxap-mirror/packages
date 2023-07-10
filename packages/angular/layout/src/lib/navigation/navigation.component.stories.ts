import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationComponent } from './navigation.component';

import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS,
} from '../tokens';

addDecorator(moduleMetadata({
  imports: [
    BrowserAnimationsModule,
    RouterTestingModule,
  ],
  providers: [
    {
      provide: RXAP_NAVIGATION_CONFIG,
      useValue: [
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
          divider: true,
          title: 'My Title Divider Item',
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
      ],
    },
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
}));

export default {
  title: 'NavigationComponent',
  component: NavigationComponent,
};

export const basic = () => ({
  component: NavigationComponent,
  props: {
    root: true,
  },
});
