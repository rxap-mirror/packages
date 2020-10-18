import {
  Directive,
  NgModule,
  OnInit,
  OnDestroy,
  Inject
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import {
  tap,
  switchMap,
  first
} from 'rxjs/operators';

@Directive({
  selector: 'mat-tab-group[rxapScrollToTabOnFocus]',
})
export class ScrollToTabOnFocusDirective implements OnInit, OnDestroy {

  public subscription: Subscription | null = null;

  constructor(
    @Inject(MatTabGroup)
    private readonly matTabGroup: MatTabGroup
  ) { }

  public ngOnInit() {

    this.subscription = this.matTabGroup.selectedIndexChange.pipe(
      switchMap(() => this.matTabGroup.animationDone.pipe(
        first(),
        tap(() => this.matTabGroup._elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })),
      )),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}

@NgModule({
  exports:      [ ScrollToTabOnFocusDirective ],
  declarations: [ ScrollToTabOnFocusDirective ],
})
export class ScrollToTabOnFocusDirectiveModule {}
