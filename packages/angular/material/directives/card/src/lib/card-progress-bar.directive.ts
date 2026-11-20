import { ChangeDetectorRef, Directive, effect, HostBinding, input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import {
  MatProgressBar,
  ProgressBarMode,
} from '@angular/material/progress-bar';
import {
  Observable,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: 'mat-progress-bar[rxapCardProgressBar]',
  standalone: true,
})
export class CardProgressBarDirective implements OnInit, OnDestroy, OnChanges {
  private readonly progressBar = inject<MatProgressBar>(MatProgressBar);
  private readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);


  @HostBinding('style.top')
  public top = '0px';

  @HostBinding('style.position')
  public position = 'absolute';

  @HostBinding('style.left')
  public left = '0px';

  @HostBinding('style.border-radius')
  public borderRadius = '4px 4px 0 0';

  @HostBinding('style.display')
  public display: string | null = null;

  public readonly loading$ = input<Observable<boolean> | null>(null);

  public readonly mode = input<ProgressBarMode>('indeterminate');

  private subscription?: Subscription;

  constructor() {
    effect(() => {
      const mode = this.mode();
      if (this.progressBar) {
        this.progressBar.mode = mode;
      }
    });
  }

  public ngOnInit(): void {
    this.progressBar.mode = this.mode();
    this.subscribeLoading();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const loading$Change = changes['loading$'];
    if (loading$Change) {
      this.subscribeLoading();
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribeLoading(): void {
    this.subscription?.unsubscribe();
    const loading$ = this.loading$();
    if (loading$) {
      this.subscription = loading$.pipe(
        tap(loading => {
          if (loading) {
            this.display = null;
          } else {
            this.display = 'none';
          }
          this.cdr.detectChanges();
        }),
      ).subscribe();
    }
  }

}


