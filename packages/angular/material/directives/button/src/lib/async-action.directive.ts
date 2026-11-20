import { ChangeDetectorRef, Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef, input, inject } from '@angular/core';
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
  host: {
    '(click)': 'onClick()',
  },
})
export class AsyncActionDirective {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly matButton = inject(MatButton, { optional: true });


  public readonly loading$ = new ToggleSubject();

  public readonly hasError$ = new ToggleSubject();

  readonly method = input.required<() => Promise<any> | void>({ alias: "rxapAsyncAction" });

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
  private readonly directive = inject(AsyncActionDirective);
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);


  private _subscription?: Subscription;

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


