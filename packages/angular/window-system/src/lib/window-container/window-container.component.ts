import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  HostBinding,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  RXAP_WINDOW_CONTEXT,
  RXAP_WINDOW_REF,
} from '../tokens';
import {
  merge,
  Observable,
} from 'rxjs';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { WindowResizerComponent } from '../window-resizer/window-resizer.component';
import { WindowRef } from '../window-ref';
import { LoadingIndicatorService } from '@rxap/services';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PortalModule } from '@angular/cdk/portal';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WindowToolBarComponent } from '../window-tool-bar/window-tool-bar.component';
import {
  AsyncPipe,
  NgIf,
  NgStyle,
} from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { FlexModule } from '@angular/flex-layout/flex';

export interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'rxap-window-container',
  templateUrl: './window-container.component.html',
  styleUrls: [ './window-container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'rxap-window-container',
  },
  standalone: true,
  imports: [
    CdkDrag,
    FlexModule,
    ExtendedModule,
    NgStyle,
    CdkDragHandle,
    WindowToolBarComponent,
    NgIf,
    MatToolbarModule,
    PortalModule,
    MatProgressBarModule,
    WindowResizerComponent,
    AsyncPipe,
  ],
})
export class WindowContainerComponent<D> implements OnInit {

  @ContentChild('[footer]', { static: true }) public footerContent!: ElementRef<any>;

  @ViewChild('container', { static: true }) public containerRef!: ElementRef<any>;
  @ViewChild(WindowResizerComponent, { static: true }) public windowContainerResizer!: WindowResizerComponent;
  public width$!: Observable<string>;
  public height$!: Observable<string>;

  constructor(
    @Inject(RXAP_WINDOW_CONTEXT)
    public readonly context: any,
    @Inject(RXAP_WINDOW_REF)
    public readonly windowRef: WindowRef<D>,
    @Inject(LoadingIndicatorService)
    public readonly windowInstance: LoadingIndicatorService,
  ) {
  }

  @HostBinding('attr.data-id')
  public get id(): string {
    return this.context.id;
  }

  public ngOnInit() {

    this.width$ = merge(
      this.windowContainerResizer.width$,
      this.windowRef.width$,
    );

    this.height$ = merge(
      this.windowContainerResizer.height$,
      this.windowRef.height$,
    );

  }

  public onDragEnded($event: CdkDragEnd<any>) {
    const nativeElement = $event.source.element.nativeElement;
    const pos = nativeElement.getBoundingClientRect();
    $event.source.reset();
    this.windowRef.setPos(pos.left + 'px', pos.top + 'px');
  }

}
