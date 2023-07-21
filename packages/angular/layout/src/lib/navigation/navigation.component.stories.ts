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
    RouterTestingModule.withRoutes([
      {
        path: 'link-1',
        children: [
          {
            path: 'sub-1',
            children: [
              {
                path: 'sub-sub-1',
                children: [
                  {
                    path: 'sub-sub-sub-1',
                    component: NavigationComponent,
                  },
                  {
                    path: 'sub-sub-sub-2',
                    component: NavigationComponent,
                  },
                  {
                    path: 'sub-sub-sub-3',
                    component: NavigationComponent,
                  },
                ],
              },
              {
                path: 'sub-sub-2',
                component: NavigationComponent,
              },
              {
                path: 'sub-sub-3',
                component: NavigationComponent,
              },
            ],
          },
          {
            path: 'sub-2',
            component: NavigationComponent,
          },
          {
            path: 'sub-3',
            component: NavigationComponent,
          },
        ],
      },
      {
        path: 'link-2',
        component: NavigationComponent,
      },
      {
        path: 'link-3',
        component: NavigationComponent,
      },
      {
        path: 'link-4',
        children: [
          {
            path: 'sub-1',
            component: NavigationComponent,
          },
          {
            path: 'sub-2',
            component: NavigationComponent,
          },
          {
            path: 'sub-3',
            component: NavigationComponent,
          },
        ],
      },
      {
        path: 'link-5',
        component: NavigationComponent,
      },
    ]),
  ],
  providers: [
    {
      provide: RXAP_NAVIGATION_CONFIG,
      useValue: [
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
