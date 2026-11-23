import { Overlay } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDirective } from './confirm.directive';

@Component({
  selector: 'rxap-test-host',
  imports: [ConfirmDirective],
  template: `
    <button
      class="trigger"
      [rxapConfirm]="value()"
      (confirmed)="confirmed.push($event)"
      (unconfirmed)="unconfirmed.push($event)"
    >
      go
    </button>
  `,
})
class HostComponent {
  readonly value = signal<any>('');
  readonly confirmed: unknown[] = [];
  readonly unconfirmed: unknown[] = [];
}

describe('ConfirmDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const trigger = () => fixture.nativeElement.querySelector('.trigger') as HTMLButtonElement;
  const overlayContainer = () => document.querySelector('.cdk-overlay-container') as HTMLElement;
  const accept = () => (overlayContainer()?.querySelector('.accept') ?? null) as HTMLButtonElement | null;
  const decline = () => (overlayContainer()?.querySelector('.decline') ?? null) as HTMLButtonElement | null;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent, NoopAnimationsModule] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.inject(Overlay);
    overlayContainer()?.remove();
  });

  it('opens the confirm overlay on click', () => {
    expect(accept()).toBeNull();
    trigger().click();
    fixture.detectChanges();
    expect(accept()).not.toBeNull();
    expect(decline()).not.toBeNull();
  });

  it('opens only one overlay for repeated clicks', () => {
    trigger().click();
    trigger().click();
    fixture.detectChanges();
    expect(overlayContainer().querySelectorAll('.accept').length).toBe(1);
  });

  it('emits confirmed with undefined when no event value is set and closes', () => {
    trigger().click();
    fixture.detectChanges();
    accept()!.click();
    fixture.detectChanges();
    expect(host.confirmed).toEqual([undefined]);
    expect(host.unconfirmed).toEqual([]);
    expect(accept()).toBeNull();
  });

  it('emits confirmed with the bound event value', () => {
    host.value.set({ id: 1 });
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    accept()!.click();
    expect(host.confirmed).toEqual([{ id: 1 }]);
  });

  it('emits unconfirmed and closes on decline', () => {
    host.value.set('abc');
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    decline()!.click();
    fixture.detectChanges();
    expect(host.unconfirmed).toEqual(['abc']);
    expect(host.confirmed).toEqual([]);
    expect(accept()).toBeNull();
  });

  it('can be reopened after being closed', () => {
    trigger().click();
    fixture.detectChanges();
    decline()!.click();
    trigger().click();
    fixture.detectChanges();
    expect(accept()).not.toBeNull();
    accept()!.click();
    expect(host.confirmed.length).toBe(1);
  });

  it('allows a new overlay after the overlay is detached externally', () => {
    trigger().click();
    fixture.detectChanges();
    const directive = fixture.debugElement.children[0].injector.get(ConfirmDirective) as any;
    directive.overlayRef.detach();
    expect(directive.isOverlyOpen).toBe(false);
    trigger().click();
    fixture.detectChanges();
    expect(accept()).not.toBeNull();
  });

  describe('when the overlay is not disposed by the confirm result', () => {
    // the directive resets its own state after a result even if disposing the overlay does not
    // detach it (e.g. a custom overlay ref); the dispose is stubbed here to exercise that path
    function openWithoutDispose() {
      trigger().click();
      fixture.detectChanges();
      const directive = fixture.debugElement.children[0].injector.get(ConfirmDirective) as any;
      const dispose = vi.spyOn(directive.overlayRef, 'dispose').mockImplementation(() => undefined);
      return { directive, dispose };
    }

    it('resets the open state and subscription after confirming', () => {
      host.value.set('v');
      fixture.detectChanges();
      const { directive, dispose } = openWithoutDispose();
      expect(directive.isOverlyOpen).toBe(true);
      accept()!.click();
      expect(dispose).toHaveBeenCalledTimes(1);
      expect(host.confirmed).toEqual([ 'v' ]);
      expect(directive.isOverlyOpen).toBe(false);
      expect(directive.subscription).toBeNull();
    });

    it('resets the open state and subscription after declining', () => {
      host.value.set('v');
      fixture.detectChanges();
      const { directive, dispose } = openWithoutDispose();
      decline()!.click();
      expect(dispose).toHaveBeenCalledTimes(1);
      expect(host.unconfirmed).toEqual([ 'v' ]);
      expect(directive.isOverlyOpen).toBe(false);
      expect(directive.subscription).toBeNull();
    });
  });

  it('disposes the overlay on destroy', () => {
    trigger().click();
    fixture.detectChanges();
    fixture.destroy();
    expect(accept()).toBeNull();
  });

  it('computes eventValue', () => {
    const directive = fixture.debugElement.children[0].injector.get(ConfirmDirective);
    expect(directive.eventValue()).toBeUndefined();
    host.value.set(0);
    fixture.detectChanges();
    expect(directive.eventValue()).toBe(0);
  });
});
