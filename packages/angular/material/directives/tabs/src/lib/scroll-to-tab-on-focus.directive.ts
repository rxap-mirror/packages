import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import {
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

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
