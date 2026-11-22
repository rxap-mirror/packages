
import { ChangeDetectionStrategy, Component,   inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { WindowService } from '@rxap/window-system';
import { LargeWindowComponent } from './large-window/large-window.component';
import { SmallWindowComponent } from './small-window/small-window.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rxap-window-demo',
    imports: [MatButtonModule],
    templateUrl: './window-demo.component.html',
    styleUrls: ['./window-demo.component.scss']
})
export class WindowDemoComponent {

  private readonly windowService = inject(WindowService);

  openLargeWindow() {
    this.windowService.open({
      component: LargeWindowComponent,
    });
  }

  openWindow() {
    this.windowService.open({
      component: SmallWindowComponent,
    });
  }

}

export default WindowDemoComponent;
