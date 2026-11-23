import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Showcase } from '@ng-prism/core';

@Showcase<NavigateBackButtonComponent>({
  title: 'Navigate Back Button',
  category: 'Components',
  description: 'Stroked button that navigates one step back in the browser history. Content can be projected next to the button.',
  status: 'stable',
  variants: [
    { name: 'Default' },
    { name: 'With content', description: 'The projected content is shown right of the button.', content: '<span>Back to the overview</span>' },
  ],
  states: [
    { name: 'Hover', pseudo: { hover: 'button' } },
    { name: 'Focus visible', pseudo: { 'focus-visible': 'button' } },
  ],
})
@Component({
    selector: 'rxap-navigate-back-button',
    templateUrl: './navigate-back-button.component.html',
    styleUrls: ['./navigate-back-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  
    host: { class: 'rxap-navigate-back-button' },
    imports: [MatButtonModule, MatIconModule]
})
export class NavigateBackButtonComponent {

  public navigateBack() {
    window.history.back();
  }

}
