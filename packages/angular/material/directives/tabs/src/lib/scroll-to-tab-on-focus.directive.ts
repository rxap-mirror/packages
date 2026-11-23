import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import {
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Showcase } from '@ng-prism/core';

@Showcase<ScrollToTabOnFocusDirective>({
  title: 'Scroll To Tab On Focus',
  category: 'Material Directives',
  description: 'Scrolls a `mat-tab-group` into view after the selected tab has changed.',
  status: 'stable',
  host: {
    template: '<mat-tab-group rxapScrollToTabOnFocus style="width: 360px"><mat-tab label="First">Content of the first tab</mat-tab><mat-tab label="Second">Content of the second tab</mat-tab></mat-tab-group>',
  },
  imports: [
    { name: 'MatTabGroup', from: '@angular/material/tabs' },
    { name: 'MatTab', from: '@angular/material/tabs' },
  ],
  variants: [{ name: 'Default' }],
})
@Directive({
  selector: 'mat-tab-group[rxapScrollToTabOnFocus]',
  standalone: true,
})
export class ScrollToTabOnFocusDirective implements OnInit, OnDestroy {
  private readonly matTabGroup = inject<MatTabGroup>(MatTabGroup);


  public subscription: Subscription | null = null;

  public ngOnInit() {

    this.subscription = this.matTabGroup.selectedIndexChange.pipe(
      switchMap(() => this.matTabGroup.animationDone.pipe(
        take(1),
        tap(() => this.matTabGroup._elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })),
      )),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
