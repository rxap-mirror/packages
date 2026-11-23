import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { ThemeService } from '@rxap/ngx-theme';
import { BehaviorSubject } from 'rxjs';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { DefaultHeaderComponent } from './default-header/default-header.component';
import { DefaultHeaderService } from './default-header/default-header.service';
import { SettingsButtonComponent } from './default-header/settings-button/settings-button.component';
import { LayoutService } from './layout.service';
import { MinimalLayoutComponent } from './minimal-layout/minimal-layout.component';
import { NavigationItemComponent } from './navigation/navigation-item/navigation-item.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationService } from './navigation.service';
import { SidenavFooterDirective } from './sidenav/sidenav-footer.directive';
import { SidenavHeaderDirective } from './sidenav/sidenav-header.directive';
import { SidenavComponent } from './sidenav/sidenav.component';
import { RXAP_SETTINGS_MENU_ITEM, RXAP_SETTINGS_MENU_ITEM_COMPONENT, RXAP_USER_PROFILE_DATA_SOURCE } from './tokens';
import { HeaderService } from './header.service';
import { FooterService } from './footer.service';

@Component({ standalone: true, template: '' })
class Page {}

const fakeLayout = () => ({
  collapsed: signal(false),
  isMobile: signal(false),
  opened: signal(false),
  mode: signal<'side' | 'over'>('side'),
  fixedBottomGap: signal(0),
  fixedTopGap: signal(0),
  fixedInViewport: signal(true),
  pinned: signal(false),
  collapsable: signal(true),
  togglePinned: vi.fn(),
  closeSidenav: vi.fn(),
  openSidenav: vi.fn(),
  toggleOpened: vi.fn(),
});

describe('NavigationComponent / NavigationItemComponent', () => {
  const config$ = new BehaviorSubject<any[]>([]);
  let layout: ReturnType<typeof fakeLayout>;

  const setup = () => {
    layout = fakeLayout();
    TestBed.configureTestingModule({
      imports: [NavigationComponent, MatIconTestingModule, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: '**', component: Page }]),
        { provide: LayoutService, useValue: layout },
        { provide: NavigationService, useValue: { config$ } },
      ],
    });
  };

  it('renders root items from the navigation service incl. dividers', async () => {
    setup();
    config$.next([
      { label: 'Home', routerLink: '/home' },
      { divider: true, title: 'Section' },
      { label: 'Parent', routerLink: ['/parent'], children: [{ label: 'Child', routerLink: 'child' }] },
    ]);
    const f = TestBed.createComponent(NavigationComponent);
    f.componentRef.setInput('root', true);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelectorAll('li[rxap-navigation-item]')).toHaveLength(2);
    expect(el.querySelector('mat-divider')).toBeTruthy();
    expect(el.textContent).toContain('Section');
    layout.collapsed.set(true);
    f.detectChanges();
    expect(el.textContent).not.toContain('Section');
  });

  it('renders given items when not root and type guards work', () => {
    setup();
    const f = TestBed.createComponent(NavigationComponent);
    f.componentRef.setInput('items', [{ label: 'A', routerLink: '/a' }]);
    f.detectChanges();
    const c = f.componentInstance;
    expect(c.navigationItems()).toHaveLength(1);
    expect(c.isNavigationDividerItem({ divider: true })).toBe(true);
    expect(c.isNavigationItem({ label: 'A', routerLink: 'a' })).toBe(true);
    expect(c.asNavigationItem({ label: 'A', routerLink: 'a' }).label).toBe('A');
    expect(() => c.asNavigationItem({ divider: true })).toThrow('not a NavigationItem');
  });

  it('item marks itself active, shows children, and closes sidenav on click when mobile', async () => {
    setup();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/parent/x');
    const f = TestBed.createComponent(NavigationItemComponent);
    f.componentRef.setInput('item', { label: 'Parent', routerLink: ['/parent'], children: [{ label: 'C', routerLink: 'c' }] });
    f.componentRef.setInput('level', 1);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const c = f.componentInstance;
    expect(c.active()).toBe(true);
    expect(c.children()).toHaveLength(1);
    expect(c.itemClasses()).toBe('level-4');
    expect(f.nativeElement.querySelector('ul[rxap-navigation]')).toBeTruthy();
    layout.collapsed.set(true);
    expect(c.itemClasses()).toContain('invisible');
    layout.opened.set(true);
    c.onClick();
    expect(layout.opened()).toBe(false);
    layout.collapsed.set(false);
    layout.opened.set(true);
    c.onClick();
    expect(layout.opened()).toBe(true);
    layout.isMobile.set(true);
    c.onClick();
    expect(layout.opened()).toBe(false);
    expect(c.isNavigationDividerItem({ divider: true })).toBe(true);
    expect(() => c.asNavigationItem({ divider: true })).toThrow();
  });

  it('item is inactive for other urls and without children', async () => {
    setup();
    await TestBed.inject(Router).navigateByUrl('/other');
    const f = TestBed.createComponent(NavigationItemComponent);
    f.componentRef.setInput('item', { label: 'Root', routerLink: '/' });
    f.detectChanges();
    expect(f.componentInstance.children()).toBeNull();
    f.componentRef.setInput('item', { label: 'P', routerLink: '/parent' });
    f.detectChanges();
    expect(f.componentInstance.active()).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [SidenavComponent, SidenavHeaderDirective, SidenavFooterDirective],
  template: `
    <rxap-sidenav>
      <ng-template rxapSidenavHeader><b class="hdr">H</b></ng-template>
      <ng-template rxapSidenavFooter><b class="ftr">F</b></ng-template>
      <p class="projected">content</p>
    </rxap-sidenav>`,
})
class SidenavHost {}

describe('SidenavComponent', () => {
  it('delegates to the layout service and renders header, footer and content', async () => {
    const layout = fakeLayout();
    TestBed.configureTestingModule({
      imports: [SidenavHost, MatIconTestingModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useValue: layout },
        { provide: NavigationService, useValue: { config$: new BehaviorSubject([]) } },
      ],
    });
    const f = TestBed.createComponent(SidenavHost);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelector('.hdr')).toBeTruthy();
    expect(el.querySelector('.ftr')).toBeTruthy();
    expect(el.querySelector('.projected')).toBeTruthy();
    const sidenav = f.debugElement.children[0].componentInstance as SidenavComponent;
    layout.closeSidenav.mockClear();
    sidenav.togglePinned();
    expect(layout.togglePinned).toHaveBeenCalled();
    layout.closeSidenav.mockClear();
    sidenav.onOpenedChanged(true);
    expect(layout.closeSidenav).not.toHaveBeenCalled();
    sidenav.onOpenedChanged(false);
    expect(layout.closeSidenav).toHaveBeenCalledTimes(1);
    await sidenav.openSidenav();
    expect(layout.openSidenav).toHaveBeenCalled();
    await sidenav.closeSidenav();
    expect(layout.closeSidenav.mock.calls.length).toBeGreaterThanOrEqual(2);
    // pin toggle button in the collapsable sidenav
    (el.querySelector('div.cursor-pointer, mat-sidenav div div') as HTMLElement | null)?.click();
  });
});

describe('simple layouts', () => {
  it('BaseLayout and MinimalLayout render header and footer slots', () => {
    TestBed.configureTestingModule({
      imports: [BaseLayoutComponent, MinimalLayoutComponent],
      providers: [HeaderService, FooterService, provideRouter([])],
    });
    const f = TestBed.createComponent(BaseLayoutComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('rxap-header')).toBeTruthy();
    expect(f.nativeElement.querySelector('rxap-footer')).toBeTruthy();
    const m = TestBed.createComponent(MinimalLayoutComponent);
    m.detectChanges();
    expect(m.nativeElement.querySelector('rxap-header, rxap-footer')).toBeTruthy();
  });
});

describe('SettingsButtonComponent', () => {
  const setup = (extra: any[] = []) => {
    const theme = {
      darkMode: signal(false), density: signal(0), typography: signal('t'), themeName: signal('n'),
      getAvailableTypographies: () => ['A'], getAvailableThemes: () => ['B'],
      applyDensity: vi.fn(), setDensity: vi.fn(), applyTypography: vi.fn(), setTypography: vi.fn(),
      applyTheme: vi.fn(), setTheme: vi.fn(), toggleDarkTheme: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [SettingsButtonComponent, MatIconTestingModule, NoopAnimationsModule],
      providers: [{ provide: ThemeService, useValue: theme }, ...extra],
    });
    const f = TestBed.createComponent(SettingsButtonComponent);
    f.detectChanges();
    return { f, theme, c: f.componentInstance };
  };

  it('delegates theme operations', () => {
    const { c, theme } = setup();
    c.previewDensity(-1);
    expect(theme.applyDensity).toHaveBeenCalledWith(-1);
    c.restoreDensity();
    expect(theme.applyDensity).toHaveBeenCalledWith(0);
    c.setDensity(-2);
    expect(theme.setDensity).toHaveBeenCalledWith(-2);
    c.previewTypography('A');
    c.restoreTypography();
    c.setTypography('A');
    expect(theme.applyTypography).toHaveBeenCalledWith('t');
    expect(theme.setTypography).toHaveBeenCalledWith('A');
    c.previewTheme('B');
    c.restoreTheme();
    c.setTheme('B');
    expect(theme.applyTheme).toHaveBeenCalledWith('n');
    expect(theme.setTheme).toHaveBeenCalledWith('B');
    expect(c.availableThemes).toEqual(['B']);
  });

  it('runs custom item actions in the injection context', () => {
    const action = vi.fn();
    const { c } = setup([{ provide: RXAP_SETTINGS_MENU_ITEM, useValue: { label: 'x', action }, multi: true }]);
    expect(c.customItems()).toHaveLength(1);
    c.clickItem(c.customItems()[0]);
    expect(action).toHaveBeenCalled();
  });

  it('resolves custom item components lazily', async () => {
    const { c } = setup([
      { provide: RXAP_SETTINGS_MENU_ITEM_COMPONENT, useValue: Page, multi: true },
      { provide: RXAP_SETTINGS_MENU_ITEM_COMPONENT, useValue: async () => Page, multi: true },
    ]);
    await new Promise((r) => setTimeout(r, 0));
    expect(c.customItemComponents()).toHaveLength(2);
  });
});

describe('DefaultHeaderComponent', () => {
  it('renders toggle on mobile and profile icon when a profile exists', async () => {
    const layout = fakeLayout();
    layout.isMobile.set(true);
    TestBed.configureTestingModule({
      imports: [DefaultHeaderComponent, MatIconTestingModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useValue: layout },
        { provide: DefaultHeaderService, useValue: { portals: signal([]) } },
        { provide: RXAP_USER_PROFILE_DATA_SOURCE, useValue: { connect: () => new BehaviorSubject({ username: 'u' }) } },
        { provide: ThemeService, useValue: { getAvailableTypographies: () => [], getAvailableThemes: () => [], darkMode: signal(false) } },
        { provide: require('./external-apps.service').ExternalAppsService, useValue: { activeAppList: signal([]), getAppList: vi.fn() } },
      ],
    });
    const f = TestBed.createComponent(DefaultHeaderComponent);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.nativeElement.querySelector('rxap-sidenav-toggle-button')).toBeTruthy();
    expect(f.nativeElement.querySelector('rxap-user-profile-icon')).toBeTruthy();
    expect(f.componentInstance.hasPortals()).toBe(false);
  });
});

describe('LayoutComponent', () => {
  it('renders header, sidenav, logo and footer', async () => {
    const { LayoutComponent } = await import('./layout/layout.component');
    const { LogoService } = await import('./logo.service');
    const layout = fakeLayout();
    TestBed.configureTestingModule({
      imports: [LayoutComponent, MatIconTestingModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        HeaderService, FooterService,
        { provide: LayoutService, useValue: layout },
        { provide: NavigationService, useValue: { config$: new BehaviorSubject([]) } },
        { provide: LogoService, useValue: { src: signal('l.png'), width: signal(10), height: signal(5) } },
        { provide: RXAP_ENVIRONMENT, useValue: { name: 'n' } },
      ],
    });
    const f = TestBed.createComponent(LayoutComponent);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.logoSrc()).toBe('l.png');
    expect(f.componentInstance.logoWidth()).toBe(10);
    expect(f.componentInstance.logoHeight()).toBe(5);
    expect(f.nativeElement.querySelector('rxap-sidenav')).toBeTruthy();
    expect(f.nativeElement.querySelector('rxap-footer')).toBeTruthy();
  });
});
