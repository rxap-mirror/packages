import {
  Component,
  Inject,
  Injector
} from '@angular/core';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import { ButtonDefinition } from '@rxap/utilities';

@Component({
  selector:    'rxap-window-action-bar',
  templateUrl: './window-action-bar.component.html',
  styleUrls:   [ './window-action-bar.component.scss' ]
})
export class WindowActionBarComponent {

  public definitions: ButtonDefinition<any>[] | null = null;
  public position: string                            = 'start';

  constructor(@Inject(RXAP_WINDOW_CONTEXT) context: any, public injector: Injector) {
    if (context.windowRef.settings.actions) {
      this.definitions = context.windowRef.settings.actions.definitions;
      this.position    = context.windowRef.settings.actions.position || this.position;
    }
  }

}
