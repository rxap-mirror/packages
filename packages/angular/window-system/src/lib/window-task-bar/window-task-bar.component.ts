import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { WindowService } from '../window.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WindowTaskComponent } from './window-task/window-task.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'rxap-window-task-bar',
  templateUrl: './window-task-bar.component.html',
  styleUrls: [ './window-task-bar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ NgFor, WindowTaskComponent ],
})
export class WindowTaskBarComponent implements OnInit, OnDestroy {

  public subscriptions = new Subscription();

  constructor(
    @Inject(WindowService) public windowService: WindowService,
    @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
  ) {
  }

  public ngOnInit(): void {
    this.subscriptions.add(this.windowService.activeCount$.pipe(
      tap(() => this.cdr.markForCheck()),
    ).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
