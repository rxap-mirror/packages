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
import { Showcase } from '@ng-prism/core';

@Showcase<CardProgressBarDirective>({
  title: 'Card Progress Bar',
  category: 'Material Directives',
  description: 'Places a `mat-progress-bar` at the top edge of a card. The bar is hidden as soon as the loading observable emits `false`.',
  status: 'stable',
  host: {
    template: '<mat-card style="position: relative; width: 280px"><mat-progress-bar rxapCardProgressBar></mat-progress-bar><mat-card-content>Card content below the progress bar.</mat-card-content></mat-card>',
  },
  imports: [
    { name: 'MatCard', from: '@angular/material/card' },
    { name: 'MatCardContent', from: '@angular/material/card' },
    { name: 'MatProgressBar', from: '@angular/material/progress-bar' },
  ],
  variants: [
    { name: 'Indeterminate', inputs: { mode: 'indeterminate' } },
    { name: 'Query', inputs: { mode: 'query' } },
    {
      name: 'Determinate',
      inputs: { mode: 'determinate' },
      host: {
        template: '<mat-card style="position: relative; width: 280px"><mat-progress-bar rxapCardProgressBar value="60"></mat-progress-bar><mat-card-content>Card content below the progress bar.</mat-card-content></mat-card>',
      },
    },
  ],
})
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
