import {
  ChangeDetectorRef,
  Directive,
  effect,
  HostBinding,
  Inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
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

  @Input()
  public loading$: Observable<boolean> | null = null;

  public readonly mode = input<ProgressBarMode>('indeterminate');

  private subscription?: Subscription;

  constructor(
    @Inject(MatProgressBar)
    private readonly progressBar: MatProgressBar,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
  ) {
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
    if (this.loading$) {
      this.subscription = this.loading$.pipe(
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


