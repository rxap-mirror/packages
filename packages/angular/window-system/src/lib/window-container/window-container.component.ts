import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import {
  AsyncPipe,
  NgStyle,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  contentChild,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { isDefined } from '@rxap/rxjs';
import { LoadingIndicatorService } from '@rxap/services';
import { filter } from 'rxjs/operators';
import {
  RXAP_WINDOW_CONTEXT,
  RXAP_WINDOW_REF,
} from '../tokens';
import { WindowResizerComponent } from '../window-resizer/window-resizer.component';
import { WindowToolBarComponent } from '../window-tool-bar/window-tool-bar.component';

@Component({
    selector: 'rxap-window-container',
    templateUrl: './window-container.component.html',
    styleUrls: ['./window-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,

    host: {
        class: 'rxap-window-container',
        '[attr.data-id]': 'context.id',
    },
  imports: [
    CdkDrag,
    NgStyle,
    CdkDragHandle,
    WindowToolBarComponent,
    MatToolbarModule,
    PortalModule,
    MatProgressBarModule,
    WindowResizerComponent,
    AsyncPipe,
  ],
})
export class WindowContainerComponent {

  public readonly footerContent = contentChild.required<ElementRef>('[footer]');

  public readonly containerRef = viewChild.required<ElementRef>('container');
  public readonly windowContainerResizer = viewChild.required(WindowResizerComponent);

  public readonly width = signal('100%');
  public readonly height = signal('100%');

  public readonly context = inject(RXAP_WINDOW_CONTEXT);
  public readonly windowRef = inject(RXAP_WINDOW_REF);
  public readonly windowInstance = inject(LoadingIndicatorService);

  constructor() {
    this.windowRef.width$.pipe(
      isDefined(),
      filter(value => !!value?.match(/^\d+/)),
      takeUntilDestroyed(),
    ).subscribe(value => this.width.set(value));
    this.windowRef.height$.pipe(
      isDefined(),
      filter(value => !!value?.match(/^\d+/)),
      takeUntilDestroyed(),
    ).subscribe(value => this.height.set(value));
  }

  public onResizerWidth(value: string) {
    if (value?.match(/^\d+/)) {
      this.width.set(value);
    }
  }

  public onResizerHeight(value: string) {
    if (value?.match(/^\d+/)) {
      this.height.set(value);
    }
  }

  public onDragEnded($event: CdkDragEnd) {
    const nativeElement = $event.source.element.nativeElement;
    const pos = nativeElement.getBoundingClientRect();
    $event.source.reset();
    this.windowRef.setPos(pos.left + 'px', pos.top + 'px');
  }

}
