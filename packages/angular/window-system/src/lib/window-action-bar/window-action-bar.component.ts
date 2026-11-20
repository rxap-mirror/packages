import { Component, Injector, inject } from '@angular/core';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import { ButtonDefinition } from '@rxap/rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
    selector: 'rxap-window-action-bar',
    templateUrl: './window-action-bar.component.html',
    styleUrls: ['./window-action-bar.component.scss'],
    imports: [MatToolbarModule]
})
export class WindowActionBarComponent {
  injector = inject(Injector);


  public definitions: ButtonDefinition<any>[] | null = null;
  public position = 'start';

  constructor() {
    const context = inject(RXAP_WINDOW_CONTEXT);

    if (context.windowRef.settings.actions) {
      this.definitions = context.windowRef.settings.actions.definitions;
      this.position = context.windowRef.settings.actions.position || this.position;
    }
  }

}
