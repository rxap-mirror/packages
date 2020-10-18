import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LayoutModule } from './layout.component.module';
import { LayoutComponent } from './layout.component';
import { of } from 'rxjs';
import { UserService } from '@rxap/authentication';

addDecorator(moduleMetadata({
  imports:   [
    LayoutModule.withNavigation([
      {
        routerLink: [],
        label:      'Link1',
        icon:       { icon: 'volume_down' },
        children:   [
          {
            routerLink: [ '/', 'sub-1' ],
            label:      'Sub1',
            icon:       { icon: 'hourglass_top' },
            children:   [
              {
                routerLink: [ '/', 'sub-1' ],
                label:      'Sub1',
                icon:       { icon: 'hourglass_top' },
                children:   [
                  {
                    routerLink: [ '/', 'sub-1' ],
                    label:      'Sub1',
                    icon:       { icon: 'hourglass_top' },
                  },
                  {
                    routerLink: [ '/', 'sub-2' ],
                    label:      'Sub2',
                    icon:       { icon: 'cloud_download' }
                  },
                  {
                    routerLink: [ '/', 'sub-3' ],
                    label:      'Sub3',
                    icon:       { icon: 'power_settings_new' }
                  }
                ]
              },
              {
                routerLink: [ '/', 'sub-2' ],
                label:      'Sub2',
                icon:       { icon: 'cloud_download' }
              },
              {
                routerLink: [ '/', 'sub-3' ],
                label:      'Sub3',
                icon:       { icon: 'power_settings_new' }
              }
            ]
          },
          {
            routerLink: [ '/', 'sub-2' ],
            label:      'Sub2',
            icon:       { icon: 'cloud_download' }
          },
          {
            routerLink: [ '/', 'sub-3' ],
            label:      'Sub3',
            icon:       { icon: 'power_settings_new' }
          }
        ]
      },
      {
        routerLink: [ '/', 'link-2' ],
        label:      'Link2',
        icon:       { icon: 'donut_small' },
      },
      {
        routerLink: [ '/', 'link-3' ],
        label:      'Link3',
        icon:       { icon: 'event' },
        children:   [
          {
            routerLink: [ '/', 'link-3', 'sub-1' ],
            label:      'Sub1',
            icon:       { icon: 'alarm_on' }
          },
          {
            routerLink: [ '/', 'link-3', 'sub-2' ],
            label:      'Sub2',
            icon:       { icon: 'thumb_down' }
          },
          {
            routerLink: [ '/', 'link-3', 'sub-3' ],
            label:      'Sub3',
            icon:       { icon: 'trending_down' }
          }
        ]
      },
      {
        routerLink: [ '/', 'link-4' ],
        label:      'Link4',
        icon:       { icon: 'important_devices' }
      }
    ]),
    BrowserAnimationsModule,
    RouterTestingModule
  ],
  providers: [
    {
      provide:  UserService,
      useValue: {
        user$: of({
          firstname: 'Merzough',
          lastname:  'Münker',
          username:  'mmuenker',
          email:     'mmuenker@rxap.dev'
        })
      }
    }
  ]
}));

export default {
  title:     'LayoutComponent',
  component: LayoutComponent
};

export const basic = () => ({
  component: LayoutComponent
});
