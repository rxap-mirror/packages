import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { WindowRef } from '../window-ref';
import { RXAP_WINDOW_CONTEXT } from '../tokens';

@Component({
  selector:        'rxap-window-tool-bar',
  templateUrl:     './window-tool-bar.component.html',
  styleUrls:       [ './window-tool-bar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WindowToolBarComponent<D> {

  public windowRef: WindowRef<D>;

  constructor(@Inject(RXAP_WINDOW_CONTEXT) context: any) {
    this.windowRef = context.windowRef;
  }

}
