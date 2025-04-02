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
  ContentChild,
  ElementRef,
  HostBinding,
  inject,
  INJECTOR,
  OnInit,
  runInInjectionContext,
  Signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { isDefined } from '@rxap/rxjs';
import { LoadingIndicatorService } from '@rxap/services';
import { merge } from 'rxjs';
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
    changeDetection: ChangeDetectionStrategy.Default,

    host: {
        class: 'rxap-window-container',
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
export class WindowContainerComponent implements OnInit {

  @ContentChild('[footer]', { static: true }) public footerContent!: ElementRef;

  @ViewChild('container', { static: true }) public containerRef!: ElementRef;
  @ViewChild(WindowResizerComponent, { static: true }) public windowContainerResizer!: WindowResizerComponent;

  public width!: Signal<string>;
  public height!: Signal<string>;

  private readonly injector = inject(INJECTOR);
  public readonly context = inject(RXAP_WINDOW_CONTEXT);
  public readonly windowRef = inject(RXAP_WINDOW_REF);
  public readonly windowInstance = inject(LoadingIndicatorService);

  @HostBinding('attr.data-id')
  public get id(): string {
    return this.context.id;
  }

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.width = toSignal(
        merge(
          this.windowContainerResizer.width$,
          this.windowRef.width$,
        ).pipe(isDefined(), filter(value => !!value?.match(/^\d+/))),
        { initialValue: '100%' },
      );

      this.height = toSignal(
        merge(
          this.windowContainerResizer.height$,
          this.windowRef.height$,
        ).pipe(isDefined(), filter(value => !!value?.match(/^\d+/))),
        { initialValue: '100%' },
      );
    });
  }

  public onDragEnded($event: CdkDragEnd) {
    const nativeElement = $event.source.element.nativeElement;
    const pos = nativeElement.getBoundingClientRect();
    $event.source.reset();
    this.windowRef.setPos(pos.left + 'px', pos.top + 'px');
  }

}
