import {
  NavigationStatus,
  NavigationService,
  RXAP_NAVIGATION_CONFIG
} from '@rxap/layout';
import {
  Observable,
  of
} from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';

describe('@rxap/layout', () => {

  describe('navigation', () => {

    describe('NavigationService', () => {

      describe('NavigationItem Status Token', () => {

        @Injectable()
        class NavigationStatusService implements NavigationStatus {
          public isVisible(routerLink: string[]): Observable<boolean> | Promise<boolean> | boolean {
            return false;
          }
        }

        const navigation = [
          {
            routerLink: [ '/', 'overview' ],
            icon:       { svgIcon: 'home' },
            label:      `:@@navigation.overview:Overview`
          },
          {
            routerLink: [ '/', 'dashboard' ],
            icon:       { svgIcon: 'view-dashboard' },
            label:      `:@@navigation.dashboard:Dashboard`,
            status:     [ NavigationStatusService ]
          },
          {
            label:      `:@@navigation.notifications:Notifications`,
            routerLink: [ '/', 'notifications' ],
            icon:       { svgIcon: 'bell' },
            status:     [ NavigationStatusService ]
          },
          {
            routerLink: [ '/', 'settings' ],
            icon:       { svgIcon: 'cog' },
            label:      `:@@navigation.settings:Einstellungen`,
            status:     [ NavigationStatusService ],
            children:   [
              {
                routerLink: [ '/', 'settings', 'company' ],
                icon:       { svgIcon: 'domain' },
                label:      `:@@navigation.company:Company`,
                status:     [ NavigationStatusService ]
              },
              {
                routerLink: [ '/', 'settings', 'user' ],
                icon:       { svgIcon: 'account-multiple' },
                label:      `:@@navigation.user:User`,
                status:     [ NavigationStatusService ]
              },
              {
                routerLink: [ '/', 'settings', 'thing' ],
                icon:       { svgIcon: 'router-wireless' },
                label:      `:@@navigation.thing:Thing`,
                status:     [ NavigationStatusService ]
              },
              {
                routerLink: [ '/', 'settings', 'machine' ],
                icon:       { svgIcon: 'robot-industrial' },
                label:      `:@@navigation.thing.machine:Machine`,
                status:     [ NavigationStatusService ]
              },
              {
                routerLink: [ '/', 'settings', 'machine-definition' ],
                icon:       { svgIcon: 'sitemap' },
                label:      `:@@navigation.thing.machine-definition:Machine Definition`,
                status:     [ NavigationStatusService ]
              },
              {
                routerLink: [ '/', 'settings', 'node-red' ],
                icon:       { svgIcon: 'resistor-nodes' },
                label:      `:@@navigation.node-red:Node Red`,
                status:     [ NavigationStatusService ]
              }
            ]
          }
          // {
          //   routerLink: ['/', 'admin'],
          //   icon: { svgIcon: 'shield-account' },
          //   label: `:@@navigation.admin:Admin`,
          //   children: [
          //     {
          //       routerLink: ['/', 'admin', 'roles'],
          //       icon: { svgIcon: 'shield-account' },
          //       label: `:@@navigation.admin.roles:Role`,
          //     },
          //     {
          //       routerLink: ['/', 'admin', 'connection'],
          //       icon: { svgIcon: 'sitemap' },
          //       label: `:@@navigation.admin.connection:Connections`,
          //     },
          //     {
          //       routerLink: ['/', 'admin', 'data-definition'],
          //       icon: { svgIcon: 'sitemap' },
          //       label: `:@@navigation.admin.data-definitions:Data Definitions`,
          //     },
          //     {
          //       routerLink: ['/', 'admin', 'event-logs'],
          //       icon: { svgIcon: 'calendar-alert' },
          //       label: `:@@navigation.admin.event-logs:Event Logs`,
          //     },
          //     {
          //       routerLink: ['/', 'admin', 'error-logs'],
          //       icon: { svgIcon: 'alert-circle' },
          //       label: `:@@navigation.admin.error-logs:Error Logs`,
          //     },
          //     {
          //       routerLink: ['/', 'admin', 'mainflux-things'],
          //       icon: { svgIcon: 'ufo' },
          //       label: `:@@navigation.admin.mainflux-things:Mainflux Things`,
          //     },
          //     {
          //       routerLink: ['/', 'admin', 'grafana-companies'],
          //       icon: { svgIcon: 'domain' },
          //       label: `:@@navigation.admin.grafana-companies:Grafana Companies`,
          //     },
          //   ],
          // },
        ];

        let navigationService: NavigationService;
        let navigationStatusService: NavigationStatusService;

        beforeEach(() => {

          TestBed.configureTestingModule({
            providers: [
              NavigationService,
              {
                provide:  RXAP_NAVIGATION_CONFIG,
                useValue: navigation
              },
              NavigationStatusService
            ]
          });

          navigationService       = TestBed.inject(NavigationService);
          navigationStatusService = TestBed.inject(NavigationStatusService);

        });

        describe('checkNavigationItemStatusProviders', () => {

          it('should return the divider navigation item', async () => {

            const nav = await navigationService.checkNavigationItemStatusProviders({
              divider: true
            }).pipe(take(1)).toPromise();

            expect(nav).toEqual({ divider: true });

          });

          it('should return the navigation item without status providers', async () => {

            const nav = await navigationService.checkNavigationItemStatusProviders({
              label:      'test',
              routerLink: [ '/', 'test' ]
            }).pipe(take(1)).toPromise();

            expect(nav).toEqual({
              label:      'test',
              routerLink: [ '/', 'test' ]
            });

          });

          it('should return null if the isVisible check returns false', async () => {

            spyOn(navigationStatusService, 'isVisible').and.returnValue(of(false));

            const nav = await navigationService.checkNavigationItemStatusProviders({
              label:      'test',
              routerLink: [ '/', 'test' ],
              status:     [ NavigationStatusService ]
            }).pipe(take(1)).toPromise();

            expect(nav).toBeNull();

          });

          it('should return the navigation item if the isVisible check returns true', async () => {

            spyOn(navigationStatusService, 'isVisible').and.returnValue(of(true));

            const nav = await navigationService.checkNavigationItemStatusProviders({
              label:      'test',
              routerLink: [ '/', 'test' ],
              status:     [ NavigationStatusService ]
            }).pipe(take(1)).toPromise();

            expect(nav).toEqual({
              label:      'test',
              routerLink: [ '/', 'test' ],
              status:     [ NavigationStatusService ]
            });

          });

          it('should apply the navigation check logic to children', async () => {

            spyOn(navigationStatusService, 'isVisible').and.callFake((routerLink: string[]) => {
              if (routerLink.includes('hidden')) {
                return of(false);
              }
              return of(true);
            });

            const nav = await navigationService.checkNavigationItemStatusProviders({
              label:      'test',
              routerLink: [ '/', 'test' ],
              children:   [
                {
                  label:      'child1',
                  routerLink: [ '/', 'test', 'sub' ],
                  status:     [ NavigationStatusService ]
                },
                {
                  label:      'child1',
                  routerLink: [ '/', 'test', 'hidden' ],
                  status:     [ NavigationStatusService ]
                }
              ],
              status:     [ NavigationStatusService ]
            }).pipe(take(1)).toPromise();

            expect(nav).toEqual({
              label:      'test',
              routerLink: [ '/', 'test' ],
              children:   [
                {
                  label:      'child1',
                  routerLink: [ '/', 'test', 'sub' ],
                  status:     [ NavigationStatusService ]
                }
              ],
              status:     [ NavigationStatusService ]
            });

          });

        });


      });

    });

  });

});
