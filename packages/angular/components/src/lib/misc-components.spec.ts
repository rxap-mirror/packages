import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CopyToClipboardButtonComponent } from './copy-to-clipboard-button/copy-to-clipboard-button.component';
import { CopyToClipboardComponent } from './copy-to-clipboard/copy-to-clipboard.component';
import { EmptyRouterOutletComponent } from './empty-router-outlet/empty-router-outlet.component';
import { NavigateBackButtonComponent } from './navigate-back-button/navigate-back-button.component';

describe('CopyToClipboardButtonComponent', () => {
  it('opens a snackbar when copied', () => {
    const fixture = TestBed.createComponent(CopyToClipboardButtonComponent);
    fixture.detectChanges();
    const snackbar = fixture.debugElement.injector.get(MatSnackBar);
    const open = vi.spyOn(snackbar, 'open').mockImplementation(() => undefined as any);
    fixture.componentInstance.copied();
    expect(open).toHaveBeenCalledWith(expect.anything(), 'OK', { duration: 2500 });
  });

  it('click does not propagate to the parent', () => {
    const fixture = TestBed.createComponent(CopyToClipboardButtonComponent);
    fixture.detectChanges();
    const parentClick = vi.fn();
    fixture.nativeElement.addEventListener('click', parentClick);
    const stop = vi.fn();
    const event = new MouseEvent('click', { bubbles: true });
    event.stopPropagation = stop;
    fixture.nativeElement.querySelector('button').dispatchEvent(event);
    expect(stop).toHaveBeenCalled();
  });
});

@Component({
  imports: [CopyToClipboardComponent],
  template: `
    <rxap-copy-to-clipboard
      [value]="value()"
      [position]="position()"
      [active]="active()"
    >{{ content() }}</rxap-copy-to-clipboard>
  `,
})
class CopyHost {
  readonly value = signal('copy me');
  readonly position = signal<'before' | 'after'>('before');
  readonly active = signal(true);
  readonly content = signal('');
}

describe('CopyToClipboardComponent', () => {
  function create() {
    TestBed.configureTestingModule({ imports: [CopyHost, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(CopyHost);
    fixture.detectChanges();
    return fixture;
  }
  const buttons = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelectorAll('rxap-copy-to-clipboard-button');

  it('shows the value as fallback when nothing is projected', () => {
    const f = create();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('copy me');
    expect(buttons(f).length).toBe(1);
  });

  it('computes position flags', () => {
    const f = create();
    const c = f.debugElement.children[0].componentInstance as CopyToClipboardComponent;
    expect(c.isPositionBefore()).toBe(true);
    expect(c.isPositionAfter()).toBe(false);
    f.componentInstance.position.set('after');
    f.detectChanges();
    expect(c.isPositionBefore()).toBe(false);
    expect(c.isPositionAfter()).toBe(true);
    expect(buttons(f).length).toBe(1);
  });

  it('hides the button when inactive', () => {
    const f = create();
    f.componentInstance.active.set(false);
    f.detectChanges();
    expect(buttons(f).length).toBe(0);
  });
});

describe('NavigateBackButtonComponent', () => {
  it('navigates back in history', () => {
    const spy = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NavigateBackButtonComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('EmptyRouterOutletComponent', () => {
  it('renders child routes', async () => {
    @Component({ template: 'child-content' })
    class Child {}
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: EmptyRouterOutletComponent, children: [{ path: 'c', component: Child }] }]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/c');
    expect(harness.routeNativeElement?.textContent).toContain('child-content');
    expect(TestBed.inject(Router).url).toBe('/c');
  });
});
