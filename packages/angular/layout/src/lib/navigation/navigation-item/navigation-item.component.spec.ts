import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideRouter,
  Router,
} from '@angular/router';
import { LayoutService } from '../../layout.service';
import { NavigationItem } from '../navigation-item';
import { NavigationItemComponent } from './navigation-item.component';

@Component({ standalone: true, template: '' })
class Page {}

describe('NavigationItemComponent', () => {

  function setup() {
    const layout = {
      collapsed: signal(false),
      isMobile: signal(false),
      opened: signal(false),
    };
    TestBed.configureTestingModule({
      imports: [ NavigationItemComponent, MatIconTestingModule, NoopAnimationsModule ],
      providers: [
        provideRouter([ { path: '**', component: Page } ]),
        { provide: LayoutService, useValue: layout },
      ],
    });
    return layout;
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asNavigationItem returns a real navigation item unchanged', () => {
    setup();
    const f = TestBed.createComponent(NavigationItemComponent);
    f.componentRef.setInput('item', { label: 'A', routerLink: '/a' });
    const item: NavigationItem = { label: 'B', routerLink: '/b' };
    expect(f.componentInstance.asNavigationItem(item)).toBe(item);
    expect(f.componentInstance.isNavigationItem(item)).toBe(true);
    expect(f.componentInstance.isNavigationDividerItem(item)).toBeFalsy();
  });

  it('updates the active state (debounced) after a navigation end event', async () => {
    setup();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');
    const f = TestBed.createComponent(NavigationItemComponent);
    f.componentRef.setInput('item', { label: 'P', routerLink: [ '/parent' ] });
    f.detectChanges();
    expect(f.componentInstance.active()).toBe(false);

    vi.useFakeTimers();
    await router.navigateByUrl('/parent/child');
    // not yet updated, the url is debounced
    expect(f.componentInstance.active()).toBe(false);
    await vi.advanceTimersByTimeAsync(150);
    expect(f.componentInstance.active()).toBe(true);
  });

  it('supports a string router link with multiple fragments', async () => {
    setup();
    await TestBed.inject(Router).navigateByUrl('/a/b/c');
    const f = TestBed.createComponent(NavigationItemComponent);
    f.componentRef.setInput('item', { label: 'AB', routerLink: '/a/b' });
    f.detectChanges();
    expect(f.componentInstance.active()).toBe(true);
    f.componentRef.setInput('item', { label: 'AX', routerLink: '/a/x' });
    f.detectChanges();
    expect(f.componentInstance.active()).toBe(false);
  });

  it('does not close the sidenav on click when neither mobile nor collapsed', () => {
    const layout = setup();
    const f = TestBed.createComponent(NavigationItemComponent);
    f.componentRef.setInput('item', { label: 'A', routerLink: '/a' });
    layout.opened.set(true);
    f.componentInstance.onClick();
    expect(layout.opened()).toBe(true);
  });
});
