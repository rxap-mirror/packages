import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy
} from '@angular/core';
import { UpdateAvailableEvent } from '@angular/service-worker';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import {
  interval,
  Subscription
} from 'rxjs';
import {
  tap,
  first
} from 'rxjs/operators';
import { LifeCycleService } from '@rxap/life-cycle';
import { log } from '@rxap/utilities/rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector:        'rxap-prompt-update',
  templateUrl:     './prompt-update.component.html',
  styleUrls:       [ './prompt-update.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone:      true,
  imports:         [
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatButtonModule
  ]
})
export class PromptUpdateComponent implements OnInit, OnDestroy {
  public static AUTO_UPDATE_IN = 1000 * 60 * 1.5;

  public progress: number = 1;

  public subscription?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly event: UpdateAvailableEvent,
    @Inject(MatDialogRef)
    private readonly dialogRef: MatDialogRef<boolean>,
    @Inject(LifeCycleService)
    private readonly lifecycle: LifeCycleService
  ) {}

  public ngOnInit(): void {
    this.subscription = this.lifecycle
      .whenReady(() =>
        interval(100).pipe(
          tap(
            (i) =>
              (this.progress = Math.floor(
                ((i + 1) / (PromptUpdateComponent.AUTO_UPDATE_IN / 100)) * 100
              ))
          ),
          first((i) => i >= PromptUpdateComponent.AUTO_UPDATE_IN / 100),
          log('start auto update'),
          tap(() => this.dialogRef.close(true))
        )
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
