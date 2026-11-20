import {
  ChangeDetectorRef,
  Directive,
  HostListener,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
  input
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ToggleSubject } from '@rxap/rxjs';
import { isPromise } from '@rxap/utilities';
import {
  Subscription,
  tap,
} from 'rxjs';

@Directive({
  selector: '[rxapAsyncAction]',
  standalone: true,
})
export class AsyncActionDirective {

  public readonly loading$ = new ToggleSubject();

  public readonly hasError$ = new ToggleSubject();

  readonly method = input.required<() => Promise<any> | void>({ alias: "rxapAsyncAction" });

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Optional() private readonly matButton?: MatButton,
  ) {
  }

  @HostListener('click')
  public onClick() {
    const method = this.method();
    if (!(typeof method === 'function')) {
      throw new Error('The method must be a function!');
    }
    const result = method();
    if (isPromise(result)) {
      this.loading$.enable();
      this.hasError$.disable();
      if (this.matButton) {
        this.matButton.disabled = true;
      }
      result.then(() => {
        this.loading$.disable();
        if (this.matButton) {
          this.matButton.disabled = false;
        }
        this.cdr.detectChanges();
      });
      result.catch(() => {
        this.hasError$.disable();
        if (this.matButton) {
          this.matButton.disabled = false;
        }
        this.cdr.detectChanges();
      });
    }
  }

}

@Directive({
  selector: '[rxapAsyncActionAnimation]',
  standalone: true,
})
export class AsyncActionAnimationDirective implements OnInit, OnDestroy {

  private _subscription?: Subscription;

  constructor(
    private readonly directive: AsyncActionDirective,
    private readonly template: TemplateRef<unknown>,
    private readonly vcr: ViewContainerRef,
  ) {
  }

  ngOnInit() {
    this._subscription = this.directive.loading$.pipe(
      tap(loading => {
        if (loading) {
          this.vcr.createEmbeddedView(this.template);
        } else {
          this.vcr.clear();
        }
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}


