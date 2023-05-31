import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Inject
} from '@angular/core';
import { WindowService } from '../window.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WindowTaskComponent } from './window-task/window-task.component';
import { NgFor } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector:        'rxap-window-task-bar',
  templateUrl:     './window-task-bar.component.html',
  styleUrls:       [ './window-task-bar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports:         [ FlexModule, NgFor, WindowTaskComponent ]
})
export class WindowTaskBarComponent implements OnInit, OnDestroy {

  public subscriptions = new Subscription();

  constructor(
    @Inject(WindowService) public windowService: WindowService,
    @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.subscriptions.add(this.windowService.activeCount$.pipe(
      tap(() => this.cdr.markForCheck())
    ).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
