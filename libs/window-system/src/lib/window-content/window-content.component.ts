import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { RXAP_WINDOW_CONTAINER_CONTEXT } from '../tokens';
import { WindowContainerContext } from '../window-context';

@Component({
  selector:        'rxap-window-content',
  templateUrl:     './window-content.component.html',
  styleUrls:       [ './window-content.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowContentComponent {

  public context: WindowContainerContext<any>;

  constructor(@Inject(RXAP_WINDOW_CONTAINER_CONTEXT) context: any, public injector: Injector) {
    this.context = context;
  }

}
