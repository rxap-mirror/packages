import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Base Layout',
  category: 'Layout',
  description: 'Page frame with a fixed header and footer around the projected page content. The header and footer are only rendered while a `rxapHeader` or `rxapFooter` template is registered.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    {
      name: 'With content',
      content: '<div style="padding: 16px"><h2>Page content</h2><p>The projected content is placed between the header and the footer.</p></div>',
    },
    {
      name: 'Empty',
    },
  ],
})
@Component({
    selector: 'rxap-base-layout',
    imports: [
        HeaderComponent,
        FooterComponent,
    ],
    templateUrl: './base-layout.component.html',
    styleUrl: './base-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent {}
