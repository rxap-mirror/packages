import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { PubSubService, RXAP_TOPICS } from '@rxap/ngx-pub-sub';
import { Subject } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
import { ConfigService } from '@rxap/config';
import { MatDialog } from '@angular/material/dialog';
import { DefaultHeaderService } from './default-header/default-header.service';
import { AppsButtonComponent } from './default-header/apps-button/apps-button.component';
import { SidenavToggleButtonComponent } from './default-header/sidenav-toggle-button/sidenav-toggle-button.component';
import { UserProfileIconComponent } from './default-header/user-profile-icon/user-profile-icon.component';
import { ExternalAppsService } from './external-apps.service';
import { FooterComponent } from './footer/footer.component';
import { FooterDirective } from './footer/footer.directive';
import { FooterService } from './footer.service';
import { HeaderComponent } from './header/header.component';
import { HeaderDirective } from './header/header.directive';
import { HeaderService } from './header.service';
import { LayoutService } from './layout.service';
import { NavigationProgressBarComponent } from './navigation-progress-bar/navigation-progress-bar.component';
import { ReleaseInfoComponent } from './release-info/release-info.component';
import { RXAP_RELEASE_INFO_MODULE } from './tokens';

@Component({ standalone: true, template: '<i class="portal-content">x</i>' })
class Content {}

@Component({
  standalone: true,
  imports: [HeaderComponent, HeaderDirective],
  template: `<rxap-header color="primary" /> @if (show()) { <p *rxapHeader class="from-directive">hdr</p> }`,
})
class HeaderHost { show = signal(true); }

@Component({
  standalone: true,
  imports: [FooterComponent, FooterDirective],
  template: `<rxap-footer /> @if (show()) { <p *rxapFooter class="from-directive">ftr</p> }`,
})
class FooterHost { show = signal(true); }

const matchMedia = (matches: boolean) => {
  const listeners: Array<(e: any) => void> = [];
  return {
    mq: { matches, addEventListener: (_: string, l: any) => listeners.push(l) },
    emit: (m: boolean) => listeners.forEach((l) => l({ matches: m })),
  };
};

describe('header / footer', () => {
  it.each([
    ['header', HeaderHost, HeaderService],
    ['footer', FooterHost, FooterService],
  ] as const)('%s renders directive portals and nothing when empty', async (_n, Host: any, Service: any) => {
    TestBed.configureTestingModule({ imports: [Host], providers: [Service] });
    const f = TestBed.createComponent(Host) as ComponentFixture<any>;
    const service = TestBed.inject(Service) as HeaderService;
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('.from-directive')).toBeTruthy();
    expect(service.portalCount()).toBe(1);
    f.componentInstance.show.set(false);
    f.detectChanges();
    await f.whenStable();
    expect(service.portalCount()).toBe(0);
    expect(f.nativeElement.querySelector('mat-toolbar')).toBeNull();
  });

  it('header renders a component portal', async () => {
    TestBed.configureTestingModule({ imports: [HeaderComponent], providers: [HeaderService] });
    TestBed.inject(HeaderService).pushPortal(new ComponentPortal(Content));
    const f = TestBed.createComponent(HeaderComponent);
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('.portal-content')).toBeTruthy();
    expect(f.componentInstance.hasPortals()).toBe(true);
    void TemplatePortal;
  });
});

describe('NavigationProgressBarComponent', () => {
  it('shows while navigating', async () => {
    const events = new Subject<any>();
    TestBed.configureTestingModule({
      imports: [NavigationProgressBarComponent, NoopAnimationsModule],
      providers: [{ provide: Router, useValue: { events } }],
    });
    const f = TestBed.createComponent(NavigationProgressBarComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
    events.next(new NavigationEnd(1, '/', '/'));
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-progress-bar')).toBeNull();
    events.next(new NavigationStart(2, '/x'));
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
    events.next(new NavigationCancel(2, '/x', ''));
    events.next({ other: true });
    f.detectChanges();
    expect(f.componentInstance.navigating()).toBe(false);
  });
});

describe('ReleaseInfoComponent', () => {
  const setup = (modules?: any[]) => {
    const open = jest.fn();
    TestBed.configureTestingModule({
      imports: [ReleaseInfoComponent, NoopAnimationsModule],
      providers: [
        { provide: RXAP_ENVIRONMENT, useValue: { name: 'test', release: '1.2.3', tag: 'v1' } },
        { provide: MatDialog, useValue: { open } },
        ...(modules ? modules.map((m) => ({ provide: RXAP_RELEASE_INFO_MODULE, useValue: m, multi: true })) : []),
      ],
    });
    TestBed.overrideComponent(ReleaseInfoComponent, { set: { providers: [{ provide: MatDialog, useValue: { open } }] } });
    const f = TestBed.createComponent(ReleaseInfoComponent);
    f.detectChanges();
    return { f, open };
  };

  it('renders without modules and opens the environment dialog', () => {
    const { f, open } = setup();
    expect(f.nativeElement.querySelector('table')).toBeNull();
    f.nativeElement.querySelector('button').click();
    expect(open).toHaveBeenCalledWith(expect.anything(), { closeOnNavigation: true });
  });

  it('lists modules', () => {
    const { f } = setup([{ name: 'm', version: '1', hash: 'h' }]);
    const cells = Array.from(f.nativeElement.querySelectorAll('tbody tr *')).map((e: any) => e.textContent);
    expect(cells).toEqual(['m', '1', 'h']);
  });
});

describe('header toolbar buttons', () => {
  it('SidenavToggleButtonComponent toggles the layout service', () => {
    const layout = { opened: signal(false), toggleOpened: jest.fn() };
    TestBed.configureTestingModule({
      imports: [SidenavToggleButtonComponent, MatIconTestingModule],
      providers: [{ provide: LayoutService, useValue: layout }],
    });
    const f = TestBed.createComponent(SidenavToggleButtonComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-icon').textContent).toBe('menu');
    layout.opened.set(true);
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-icon').textContent).toBe('menu_open');
    f.nativeElement.querySelector('button').click();
    expect(layout.toggleOpened).toHaveBeenCalled();
  });

  it('UserProfileIconComponent derives the username and publishes logout', () => {
    const publish = jest.fn();
    TestBed.configureTestingModule({
      imports: [UserProfileIconComponent, MatIconTestingModule, NoopAnimationsModule],
      providers: [{ provide: PubSubService, useValue: { publish } }],
    });
    const f = TestBed.createComponent(UserProfileIconComponent);
    f.componentRef.setInput('profile', { username: 'bob' });
    f.detectChanges();
    expect(f.componentInstance.username()).toBe('bob');
    f.componentRef.setInput('profile', null);
    f.detectChanges();
    expect(f.componentInstance.username()).toBeNull();
    f.componentInstance.logout();
    expect(publish).toHaveBeenCalledWith(RXAP_TOPICS.authentication.logout);
  });

  it('AppsButtonComponent shows apps and toggles the list', async () => {
    const activeAppList = signal<any[]>([]);
    const getAppList = jest.fn();
    TestBed.configureTestingModule({
      imports: [AppsButtonComponent, MatIconTestingModule],
      providers: [provideRouter([]), { provide: ExternalAppsService, useValue: { activeAppList, getAppList } }],
    });
    const f = TestBed.createComponent(AppsButtonComponent);
    f.detectChanges();
    expect(getAppList).toHaveBeenCalled();
    expect(f.componentInstance.hasApps()).toBe(false);
    expect(f.nativeElement.querySelector('button')).toBeNull();
    activeAppList.set([{ label: 'A', href: 'http://a' }, { label: 'B', routerLink: ['/b'] }, { label: 'C' }]);
    f.detectChanges();
    f.nativeElement.querySelector('button').click();
    expect(f.componentInstance.isOpen()).toBe(true);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.label')).toHaveLength(3);
    expect(f.nativeElement.querySelector('a[href="http://a"]')).toBeTruthy();
    expect(f.nativeElement.querySelector('button[disabled]')).toBeTruthy();
  });
});

describe('DefaultHeaderService', () => {
  it('combines injected component items and pushed portals', async () => {
    const { RXAP_DEFAULT_HEADER_ITEM_COMPONENT } = await import('./tokens');
    TestBed.configureTestingModule({
      providers: [
        DefaultHeaderService,
        { provide: RXAP_DEFAULT_HEADER_ITEM_COMPONENT, useValue: Content, multi: true },
        { provide: RXAP_DEFAULT_HEADER_ITEM_COMPONENT, useValue: async () => Content, multi: true },
      ],
    });
    const s = TestBed.inject(DefaultHeaderService);
    await new Promise((r) => setTimeout(r, 0));
    expect(s.portalCount()).toBe(2);
    const p = new ComponentPortal(Content);
    s.pushPortal(p);
    s.pushPortal(p);
    expect(s.portalCount()).toBe(3);
    s.removePortal(new ComponentPortal(Content));
    s.removePortal(p);
    expect(s.portalCount()).toBe(2);
  });
});

describe('LayoutService', () => {
  const setup = (opts: { mobile?: boolean; config?: Record<string, any>; defaults?: any } = {}) => {
    const media = matchMedia(!!opts.mobile);
    TestBed.configureTestingModule({
      providers: [
        LayoutService, HeaderService, FooterService,
        { provide: MediaMatcher, useValue: { matchMedia: () => media.mq } },
        { provide: ConfigService, useValue: { get: (k: string, d: any) => opts.config?.[k] ?? d } },
        ...(opts.defaults ? [{ provide: require('./tokens').RXAP_NAVIGATION_LAYOUT_CONFIG_DEFAULTS, useValue: opts.defaults }] : []),
      ],
    });
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    return { s: TestBed.inject(LayoutService), media };
  };

  afterEach(() => jest.restoreAllMocks());

  it('desktop defaults: collapsable, closed, over mode', () => {
    const { s } = setup();
    TestBed.tick();
    expect(s.isMobile()).toBe(false);
    expect(s.collapsable()).toBe(true);
    expect(s.opened()).toBe(false);
    expect(s.mode()).toBe('over');
    expect(s.collapsed()).toBe(true);
    expect(s.fixedTopGap()).toBe(0);
    expect(s.fixedBottomGap()).toBe(0);
  });

  it('toggle, open and close', () => {
    const { s } = setup();
    s.toggleOpened();
    expect(s.opened()).toBe(true);
    s.closeSidenav();
    expect(s.opened()).toBe(false);
    s.openSidenav();
    expect(s.opened()).toBe(true);
  });

  it('pinning switches to side mode and opens', () => {
    const { s } = setup();
    s.togglePinned();
    TestBed.tick();
    expect(s.mode()).toBe('side');
    expect(s.opened()).toBe(true);
    expect(s.collapsed()).toBe(false);
    s.togglePinned();
    TestBed.tick();
    expect(s.mode()).toBe('over');
    expect(s.opened()).toBe(false);
  });

  it('reacts to media query changes', () => {
    const { s, media } = setup();
    TestBed.tick();
    media.emit(true);
    TestBed.tick();
    expect(s.isMobile()).toBe(true);
    expect(s.collapsable()).toBe(false);
  });

  it('gaps scale with portal counts', () => {
    const { s } = setup();
    TestBed.inject(HeaderService).pushPortal(new ComponentPortal(Content));
    TestBed.inject(FooterService).pushPortal(new ComponentPortal(Content));
    TestBed.inject(FooterService).pushPortal(new ComponentPortal(Content));
    expect(s.fixedTopGap()).toBe(64);
    expect(s.fixedBottomGap()).toBe(128);
  });

  it('honors configuration and defaults, including non collapsable', () => {
    const { s } = setup({ config: { 'navigation.fixedInViewport': false }, defaults: { collapsable: false, mobileQuery: '(x)' } });
    expect(s.fixedInViewport()).toBe(false);
    expect(s.collapsable()).toBe(false);
    expect(s.mode()).toBe('side');
    expect(s.opened()).toBe(true);
  });
});
