import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { WindowContentComponent } from '../window-content/window-content.component';
import { WindowContainerComponent } from '../window-container/window-container.component';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Default Window',
  category: 'Window System',
  description: 'The window component that the `WindowService` opens by default: a window container with the window content. The window ref, the window context and the content are provided with demo data by the styleguide host.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-default-window',
    templateUrl: './default-window.component.html',
    styleUrls: ['./default-window.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WindowContainerComponent, WindowContentComponent]
})
export class DefaultWindowComponent {
}
