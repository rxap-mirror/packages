import {
  ChangeDetectorRef,
  Directive,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
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

  @Input({
    alias: 'rxapAsyncAction',
    required: true,
  }) method!: () => Promise<any> | void;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Optional() private readonly matButton?: MatButton,
  ) {
  }

  @HostListener('click')
  public onClick() {
    if (!(typeof this.method === 'function')) {
      throw new Error('The method must be a function!');
    }
    const result = this.method();
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


