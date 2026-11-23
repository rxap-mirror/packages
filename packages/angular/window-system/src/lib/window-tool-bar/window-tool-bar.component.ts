import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WindowRef } from '../window-ref';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import { MatButtonModule } from '@angular/material/button';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { PortalModule } from '@angular/cdk/portal';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Window Tool Bar',
  category: 'Window System',
  description: 'Title bar of a window with the icon and the title and the buttons to minimize, maximize and close the window. The window ref is provided with demo data by the styleguide host.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-window-tool-bar',
    templateUrl: './window-tool-bar.component.html',
    styleUrls: ['./window-tool-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatToolbarModule,
    PortalModule,
    MatIconModule,
    IconDirective,
    MatButtonModule,
    AsyncPipe
]
})
export class WindowToolBarComponent<D> {

  public windowRef: WindowRef<D>;

  constructor() {
    const context = inject(RXAP_WINDOW_CONTEXT);

    this.windowRef = context.windowRef;
  }

}
