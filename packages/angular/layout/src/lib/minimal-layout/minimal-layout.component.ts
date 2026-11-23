import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseLayoutComponent } from '../base-layout/base-layout.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NavigationProgressBarComponent } from '../navigation-progress-bar/navigation-progress-bar.component';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Minimal Layout',
  category: 'Layout',
  description: 'Route shell without navigation: header, navigation progress bar, router outlet and footer. In the styleguide no navigation has completed yet, so the progress bar is shown.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-minimal-layout',
    imports: [RouterOutlet, BaseLayoutComponent, NavigationProgressBarComponent, HeaderComponent, FooterComponent],
    templateUrl: './minimal-layout.component.html',
    styleUrl: './minimal-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MinimalLayoutComponent {}
