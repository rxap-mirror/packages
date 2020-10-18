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
  MatDialogRef
} from '@angular/material/dialog';
import {
  interval,
  Subscription
} from 'rxjs';
import {
  tap,
  first
} from 'rxjs/operators';
import { log } from '@rxap/utilities';
import { LifeCycleService } from '@rxap/life-cycle';

@Component({
  selector:        'rxap-prompt-update',
  templateUrl:     './prompt-update.component.html',
  styleUrls:       [ './prompt-update.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default
})
export class PromptUpdateComponent implements OnInit, OnDestroy {

  public static AUTO_UPDATE_IN = 1000 * 60 * 1.5;

  public progress: number = 1;

  public subscription?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly event: UpdateAvailableEvent,
    private readonly dialogRef: MatDialogRef<boolean>,
    private readonly lifecycle: LifeCycleService
  ) {
  }

  public ngOnInit(): void {
    this.subscription = this.lifecycle.whenReady(() => interval(100)
      .pipe(
        tap(i => this.progress = Math.floor(((i + 1) / (PromptUpdateComponent.AUTO_UPDATE_IN / 100)) * 100)),
        first(i => i >= PromptUpdateComponent.AUTO_UPDATE_IN / 100),
        log('start auto update'),
        tap(() => this.dialogRef.close(true))
      ))
                            .subscribe();
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
