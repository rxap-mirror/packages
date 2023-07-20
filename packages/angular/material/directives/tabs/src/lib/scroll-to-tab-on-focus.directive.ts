import {
  Directive,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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

  public subscription: Subscription | null = null;

  constructor(
    @Inject(MatTabGroup)
    private readonly matTabGroup: MatTabGroup,
  ) { }

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
