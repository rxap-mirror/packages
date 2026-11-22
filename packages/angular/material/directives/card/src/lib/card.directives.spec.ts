import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { CardActionDirective } from './card-action-directive';
import { CardProgressBarDirective } from './card-progress-bar.directive';

@Component({
  imports: [MatProgressBarModule, CardProgressBarDirective, CardActionDirective],
  template: `
    <div id="action" rxapCardAction></div>
    <mat-progress-bar id="bar" rxapCardProgressBar [loading$]="loading()" [mode]="mode()"></mat-progress-bar>
  `,
})
class HostComponent {
  loading = signal<Subject<boolean> | null>(null);
  mode = signal<'determinate' | 'indeterminate'>('indeterminate');
}

describe('card directives', () => {
  it('CardActionDirective positions the host', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const el = f.nativeElement.querySelector('#action') as HTMLElement;
    expect(el.style.position).toBe('absolute');
    expect(el.style.top).toBe('8px');
    expect(el.style.right).toBe('8px');
  });

  it('CardProgressBarDirective positions the bar and syncs the mode', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const el = f.nativeElement.querySelector('#bar') as HTMLElement;
    expect(el.style.position).toBe('absolute');
    expect(el.style.top).toBe('0px');
    expect(el.getAttribute('mode')).toBe('indeterminate');
    f.componentInstance.mode.set('determinate');
    f.detectChanges();
    expect(el.getAttribute('mode')).toBe('determinate');
  });

  it('hides the bar when loading$ emits false and unsubscribes on change', () => {
    const f = TestBed.createComponent(HostComponent);
    const a = new Subject<boolean>();
    const b = new Subject<boolean>();
    f.componentInstance.loading.set(a);
    f.detectChanges();
    const el = f.nativeElement.querySelector('#bar') as HTMLElement;
    a.next(false);
    f.detectChanges();
    expect(el.style.display).toBe('none');
    a.next(true);
    f.detectChanges();
    expect(el.style.display).not.toBe('none');
    f.componentInstance.loading.set(b);
    f.detectChanges();
    expect(a.observed).toBe(false);
    expect(b.observed).toBe(true);
  });
});
