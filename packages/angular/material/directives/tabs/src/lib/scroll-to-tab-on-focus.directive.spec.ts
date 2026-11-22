import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollToTabOnFocusDirective } from './scroll-to-tab-on-focus.directive';

@Component({
  imports: [MatTabsModule, ScrollToTabOnFocusDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<mat-tab-group rxapScrollToTabOnFocus><mat-tab label="a"></mat-tab><mat-tab label="b"></mat-tab></mat-tab-group>`,
})
class HostComponent {}

describe('ScrollToTabOnFocusDirective', () => {
  it('scrolls the tab group into view after the animation of a tab change', () => {
    TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const group = f.debugElement.query(By.directive(MatTabGroup)).componentInstance as MatTabGroup;
    const scroll = jest.fn();
    group._elementRef.nativeElement.scrollIntoView = scroll;
    group.selectedIndexChange.emit(1);
    group.animationDone.emit();
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth' });
    const dir = f.debugElement.query(By.directive(ScrollToTabOnFocusDirective)).injector.get(ScrollToTabOnFocusDirective);
    f.destroy();
    expect(dir.subscription?.closed).toBe(true);
  });
});
