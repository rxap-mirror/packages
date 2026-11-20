import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { WindowService } from '../window.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WindowTaskComponent } from './window-task/window-task.component';


@Component({
    selector: 'rxap-window-task-bar',
    templateUrl: './window-task-bar.component.html',
    styleUrls: ['./window-task-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WindowTaskComponent]
})
export class WindowTaskBarComponent implements OnInit, OnDestroy {
  windowService = inject<WindowService>(WindowService);
  cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);


  public subscriptions = new Subscription();

  public ngOnInit(): void {
    this.subscriptions.add(this.windowService.activeCount$.pipe(
      tap(() => this.cdr.markForCheck()),
    ).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
