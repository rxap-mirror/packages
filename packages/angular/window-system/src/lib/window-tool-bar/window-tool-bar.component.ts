import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { WindowRef } from '../window-ref';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import { MatButtonModule } from '@angular/material/button';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { PortalModule } from '@angular/cdk/portal';
import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'rxap-window-tool-bar',
  templateUrl: './window-tool-bar.component.html',
  styleUrls: [ './window-tool-bar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    MatToolbarModule,
    FlexModule,
    NgIf,
    PortalModule,
    MatIconModule,
    IconDirective,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class WindowToolBarComponent<D> {

  public windowRef: WindowRef<D>;

  constructor(@Inject(RXAP_WINDOW_CONTEXT) context: any) {
    this.windowRef = context.windowRef;
  }

}
