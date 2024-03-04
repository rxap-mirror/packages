import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  RxapWindowSystemModule,
  WindowService,
} from '@rxap/window-system';
import { LargeWindowComponent } from './large-window/large-window.component';

@Component({
  selector: 'rxap-window-demo',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, RxapWindowSystemModule ],
  templateUrl: './window-demo.component.html',
  styleUrls: ['./window-demo.component.scss'],
})
export class WindowDemoComponent {

  private readonly windowService = inject(WindowService);

  openLargeWindow() {
    this.windowService.open({
      component: LargeWindowComponent,
    });
  }
}

export default WindowDemoComponent;
