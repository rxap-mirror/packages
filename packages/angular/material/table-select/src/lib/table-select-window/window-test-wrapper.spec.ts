import { ComponentPortal } from '@angular/cdk/portal';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import { MockWindowRef, WindowTestWrapperComponent } from './window-test-wrapper';

@Component({
  template: `<span class="projected">projected</span>`,
})
class ContentComponent {
  readonly windowRef = inject(RXAP_WINDOW_REF);
}

@Component({
  template: `<span class="footer">footer</span>`,
})
class FooterComponent {}

describe('WindowTestWrapperComponent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function create() {
    const fixture = TestBed.createComponent(WindowTestWrapperComponent);
    fixture.componentRef.setInput('component', ContentComponent);
    await fixture.whenStable();
    return fixture;
  }

  it('renders the given component through the portal outlet', async () => {
    const fixture = await create();
    expect(fixture.nativeElement.querySelector('.projected')?.textContent).toBe('projected');
  });

  it('provides a MockWindowRef to the content', async () => {
    const fixture = await create();
    const content = fixture.debugElement.query(el => el.name === 'span');
    expect(content.injector.get(RXAP_WINDOW_REF)).toBeInstanceOf(MockWindowRef);
  });

  it('renders a footer portal that is set later on', async () => {
    const fixture = await create();
    vi.useFakeTimers();
    const windowRef = fixture.debugElement.query(el => el.name === 'span').injector.get(RXAP_WINDOW_REF) as MockWindowRef;
    expect(fixture.nativeElement.querySelector('.footer')).toBeNull();
    // the footer is published with a timer which is not tracked by angular
    windowRef.setFooterPortal(new ComponentPortal(FooterComponent));
    await vi.advanceTimersByTimeAsync(1);
    // angular schedules the change detection with timers as well
    await vi.advanceTimersByTimeAsync(100);
    vi.useRealTimers();
    await fixture.whenStable();
    expect(fixture.componentInstance.footer()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.footer')?.textContent).toBe('footer');
  });
});
