import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {
  MatToolbar,
  MatToolbarRow,
} from '@angular/material/toolbar';
import { HeaderService } from '../header.service';
import { Showcase } from '@ng-prism/core';

@Showcase<HeaderComponent>({
  title: 'Header',
  category: 'Layout',
  description: 'Toolbar that renders one row for each template registered with the `rxapHeader` directive. Without a registered template nothing is rendered.',
  status: 'stable',
  canvasLayout: 'stretch',
  host: { template: '<rxap-header /><ng-template rxapHeader><span style="font-size: 20px">Application title</span></ng-template>' },
  variants: [
    { name: 'Default' },
    { name: 'Primary', inputs: { color: 'primary' } },
    { name: 'Accent', inputs: { color: 'accent' } },
    { name: 'Warn', inputs: { color: 'warn' } },
    {
      name: 'Two rows',
      host: { template: '<rxap-header /><ng-template rxapHeader><span style="font-size: 20px">Application title</span></ng-template><ng-template rxapHeader><span>Sub header</span></ng-template>' },
    },
  ],
})
@Component({
    selector: 'rxap-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatToolbar,
        MatToolbarRow,
        CdkPortalOutlet,
    ]
})
export class HeaderComponent {

  public readonly color = input<ThemePalette>();

  protected readonly headerService = inject(HeaderService);

  public readonly portals = computed(() => this.headerService.portals());
  public readonly hasPortals = computed(() => this.portals().length > 0);

}
