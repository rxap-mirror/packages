import { RxapAuthenticationGuard } from './authentication.guard';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Router,
  Routes,
  ɵEmptyOutletComponent,
} from '@angular/router';
import { Location } from '@angular/common';
import { RxapAuthenticationService } from './authentication.service';

describe('Authentication', () => {

  xdescribe('Authentication Guard', () => {

    let guard: RxapAuthenticationGuard;
    let location: Location;
    let router: Router;
    let auth: RxapAuthenticationService;

    const routes: Routes = [
      {
        path: 'authentication',
        component: ɵEmptyOutletComponent,
        children: [
          {
            canActivate: [ RxapAuthenticationGuard ],
            path: 'login',
            component: ɵEmptyOutletComponent,
          },
          {
            path: 'reset-password/:token',
            component: ɵEmptyOutletComponent,
          },
          {
            path: 'loading',
            component: ɵEmptyOutletComponent,
          },
          {
            path: '**',
            redirectTo: 'login',
          },
        ],
      },
      {
        path: '',
        canActivate: [ RxapAuthenticationGuard ],
        canActivateChild: [ RxapAuthenticationGuard ],
        component: ɵEmptyOutletComponent,
        children: [
          {
            path: 'child-1',
            component: ɵEmptyOutletComponent,
          },
          {
            path: 'child-2',
            component: ɵEmptyOutletComponent,
          },
          {
            path: 'child-3',
            component: ɵEmptyOutletComponent,
          },
        ],
      },
    ];

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes(routes),
        ],
      });

      guard = TestBed.inject(RxapAuthenticationGuard);
      router = TestBed.inject(Router);
      location = TestBed.inject(Location);
      auth = TestBed.inject(RxapAuthenticationService);

    });

    it('should redirect to login component if not authenticated or to last url', fakeAsync(() => {
      auth.isAuthenticated$.next(false);
      expect(auth.isAuthenticated$.value).toBeFalsy();
      expect(guard.lastUrl).toBe(null);

      router.initialNavigation();
      tick();
      expect(location.path()).toBe('/authentication/login');
      expect(guard.lastUrl).toBe('/');

      router.navigate([ '' ]);
      tick();
      expect(location.path()).toBe('/authentication/login');
      expect(guard.lastUrl).toBe('/');

      router.navigate([ '/child-1' ]);
      tick();
      expect(location.path()).toBe('/authentication/login');
      expect(guard.lastUrl).toBe('/child-1');

      auth.isAuthenticated$.next(true);

      router.navigate([ '' ]);
      tick();
      expect(location.path()).toBe('/child-1');
      expect(guard.lastUrl).toBeNull();

      router.navigate([ '' ]);
      tick();
      expect(location.path()).toBe('/');
      expect(guard.lastUrl).toBeNull();

      auth.isAuthenticated$.next(false);

      router.navigate([ '/child-3' ]);
      tick();
      expect(location.path()).toBe('/authentication/login');
      expect(guard.lastUrl).toBe('/child-3');

      auth.isAuthenticated$.next(true);

      router.navigate([ '/child-1' ]);
      tick();
      expect(location.path()).toBe('/child-1');
      expect(guard.lastUrl).toBeNull();

      auth.isAuthenticated$.next(false);

      router.navigate([ '/child-2' ]);
      tick();
      expect(location.path()).toBe('/authentication/login');
      expect(guard.lastUrl).toBe('/child-2');

    }));

    it('should redirect from any authentication path to the last url if authenticated', fakeAsync(() => {
      auth.isAuthenticated$.next(true);
      router.initialNavigation();
      tick();

      expect(location.path()).toBe('/');

      guard.lastUrl = '/child-2';

      router.navigate([ '/authentication/login' ]);
      tick();
      expect(location.path()).toBe('/child-2');
      expect(guard.lastUrl).toBeNull();

    }));

    it(
      'should redirect from any authentication path to the last url with query params if authenticated',
      fakeAsync(() => {
        auth.isAuthenticated$.next(true);
        router.initialNavigation();
        tick();

        expect(location.path()).toBe('/');

        guard.lastUrl = '/child-2?key1=value1&key2=value2';

        router.navigate([ '/authentication/login' ]);
        tick();
        expect(location.path()).toBe('/child-2?key1=value1&key2=value2');
        expect(guard.lastUrl).toBeNull();

      }),
    );

    it('should redirect from any authentication path to the last url with fragments if authenticated', fakeAsync(() => {
      auth.isAuthenticated$.next(true);
      router.initialNavigation();
      tick();

      expect(location.path()).toBe('/');

      guard.lastUrl = '/child-2#key1=value1&key2=value2';

      router.navigate([ '/authentication/login' ]);
      tick();
      expect(location.path()).toBe('/child-2#key1=value1&key2=value2');
      expect(guard.lastUrl).toBeNull();

    }));

    it(
      'should redirect from any authentication path to the last url with fragments and query params if authenticated',
      fakeAsync(() => {
        auth.isAuthenticated$.next(true);
        router.initialNavigation();
        tick();

        expect(location.path()).toBe('/');

        guard.lastUrl = '/child-2?key1=value1&key2=value2#key1=value1&key2=value2';

        router.navigate([ '/authentication/login' ]);
        tick();
        expect(location.path()).toBe('/child-2?key1=value1&key2=value2#key1=value1&key2=value2');
        expect(guard.lastUrl).toBeNull();

      }),
    );

    it('should not redirect away from password reset path if not authenticated', fakeAsync(() => {

      auth.isAuthenticated$.next(false);

      router.initialNavigation();
      tick();

      expect(location.path()).toBe('/authentication/login');

      router.navigate([ '/authentication/reset-password/token' ]);
      tick();
      expect(location.path()).toBe('/authentication/reset-password/token');

      router.navigate([ '/authentication/login' ]);
      tick();
      expect(location.path()).toBe('/authentication/login');


    }));

    it('should not redirect away from password reset path if authenticated', fakeAsync(() => {

      auth.isAuthenticated$.next(true);

      router.initialNavigation();
      tick();

      router.navigate([ '/authentication/reset-password/token' ]);
      tick();
      expect(location.path()).toBe('/authentication/reset-password/token');

      router.navigate([ '/authentication/login' ]);
      tick();

      router.navigate([ '/authentication/reset-password/token' ]);
      tick();
      expect(location.path()).toBe('/authentication/reset-password/token');

    }));

    it('should redirect to loading component if authentication status is unknown', fakeAsync(() => {

      auth.isAuthenticated$.next(null);

      router.initialNavigation();
      tick();

      expect(location.path()).toBe('/authentication/loading');

    }));

  });

});
