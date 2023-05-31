import {
  Directive,
  HostBinding,
  OnInit,
  Input,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Inject,
  ChangeDetectorRef
} from '@angular/core';
import { MatLegacyProgressBar as MatProgressBar } from '@angular/material/legacy-progress-bar';
import {
  Observable,
  Subscription
} from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector:   'mat-progress-bar[rxapCardProgressBar]',
  standalone: true
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

  private subscription?: Subscription;

  constructor(
    @Inject(MatProgressBar)
    private readonly progressBar: MatProgressBar,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this.progressBar.mode = 'indeterminate';
    this.subscribeLoading();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const loading$Change = changes.loading$;
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


