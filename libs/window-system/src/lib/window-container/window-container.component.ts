import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import {
  Subscription,
  Observable,
  merge
} from 'rxjs';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { WindowResizerComponent } from '../window-resizer/window-resizer.component';
import { WindowRef } from '../window-ref';

@Component({
  selector:        'rxap-window-container',
  templateUrl:     './window-container.component.html',
  styleUrls:       [ './window-container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowContainerComponent<D> implements OnInit, OnDestroy {

  @ViewChild('container', { static: true }) public containerRef!: ElementRef<any>;
  @ViewChild(WindowResizerComponent, { static: true }) public windowContainerResizer!: WindowResizerComponent;

  public windowRef: WindowRef<D>;

  public width$!: Observable<string>;
  public height$!: Observable<string>;

  private _subscriptions = new Subscription();

  constructor(
    @Inject(RXAP_WINDOW_CONTEXT) context: any
  ) {
    this.windowRef = context.windowRef;
  }

  public ngOnInit() {

    this.width$ = merge(
      this.windowContainerResizer.width$,
      this.windowRef.width$
    );

    this.height$ = merge(
      this.windowContainerResizer.height$,
      this.windowRef.height$
    );

  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public onDragEnded($event: CdkDragEnd<any>) {
    const nativeElement = $event.source.element.nativeElement;
    const pos           = nativeElement.getBoundingClientRect();
    $event.source.reset();
    console.log(pos);
    this.windowRef.setPos(pos.left + 'px', pos.top + 'px');
  }

}
