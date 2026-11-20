import {
  Directive,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import {
  MatProgressBar,
  ProgressBarMode,
} from '@angular/material/progress-bar';
import { Observable } from 'rxjs';

@Directive({
  selector: 'mat-progress-bar[rxapCardProgressBar]',
  standalone: true,
  host: {
    '[style.top]': '"0px"',
    '[style.position]': '"absolute"',
    '[style.left]': '"0px"',
    '[style.border-radius]': '"4px 4px 0 0"',
    '[style.display]': 'display()',
  },
})
export class CardProgressBarDirective {
  private readonly progressBar = inject(MatProgressBar);

  protected readonly display = signal<string | null>(null);

  public readonly loading$ = input<Observable<boolean> | null>(null);

  public readonly mode = input<ProgressBarMode>('indeterminate');

  constructor() {
    effect(() => {
      this.progressBar.mode = this.mode();
    });
    effect((onCleanup) => {
      const loading$ = this.loading$();
      if (!loading$) {
        return;
      }
      const subscription = loading$.subscribe(loading => untracked(() => this.display.set(loading ? null : 'none')));
      onCleanup(() => subscription.unsubscribe());
    });
  }

}
