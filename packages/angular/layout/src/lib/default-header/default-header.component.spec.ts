import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ThemeService } from '@rxap/ngx-theme';
import { BehaviorSubject } from 'rxjs';
import { ExternalAppsService } from '../external-apps.service';
import { LayoutService } from '../layout.service';
import { RXAP_USER_PROFILE_DATA_SOURCE } from '../tokens';
import { DefaultHeaderComponent } from './default-header.component';
import { DefaultHeaderService } from './default-header.service';

describe('DefaultHeaderComponent', () => {

  function setup(profile: unknown) {
    const layout = {
      collapsed: signal(false),
      isMobile: signal(false),
      opened: signal(false),
      togglePinned: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [ DefaultHeaderComponent, MatIconTestingModule, NoopAnimationsModule ],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useValue: layout },
        { provide: DefaultHeaderService, useValue: { portals: signal([]) } },
        { provide: RXAP_USER_PROFILE_DATA_SOURCE, useValue: { connect: () => new BehaviorSubject(profile) } },
        {
          provide: ThemeService,
          useValue: { getAvailableTypographies: () => [], getAvailableThemes: () => [], darkMode: signal(false) },
        },
        { provide: ExternalAppsService, useValue: { activeAppList: signal([]), getAppList: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(DefaultHeaderComponent);
    fixture.detectChanges();
    return { fixture, layout };
  }

  it('mirrors the layout state in its signals', () => {
    const { fixture, layout } = setup({ username: 'u' });
    const component = fixture.componentInstance;
    expect(component.collapsed()).toBe(false);
    expect(component.isMobile()).toBe(false);
    expect(component.opened()).toBe(false);
    layout.collapsed.set(true);
    layout.isMobile.set(true);
    layout.opened.set(true);
    expect(component.collapsed()).toBe(true);
    expect(component.isMobile()).toBe(true);
    expect(component.opened()).toBe(true);
  });

  it('exposes the connected user profile', () => {
    const { fixture } = setup({ username: 'u' });
    expect(fixture.componentInstance.profile()).toEqual({ username: 'u' });
  });

  it('does not render the user profile icon without a profile', () => {
    const { fixture } = setup(null);
    expect(fixture.componentInstance.profile()).toBeNull();
    expect(fixture.nativeElement.querySelector('rxap-user-profile-icon')).toBeNull();
  });
});
