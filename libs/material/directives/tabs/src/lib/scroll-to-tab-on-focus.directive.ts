import {
  Directive,
  NgModule,
  OnInit,
  OnDestroy,
  Inject
} from '@angular/core';
import { MatLegacyTabGroup as MatTabGroup } from '@angular/material/legacy-tabs';
import { Subscription } from 'rxjs';
import {
  tap,
  switchMap,
  take
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
        take(1),
        tap(() => this.matTabGroup._elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' }))
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
