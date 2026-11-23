import { PortalModule } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FooterService } from '../footer.service';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Footer',
  category: 'Layout',
  description: 'Toolbar that renders one row for each template registered with the `rxapFooter` directive. Without a registered template nothing is rendered.',
  status: 'stable',
  canvasLayout: 'stretch',
  host: { template: '<rxap-footer /><ng-template rxapFooter><span>Demo App - all rights reserved</span></ng-template>' },
  variants: [
    { name: 'Single row' },
    {
      name: 'Two rows',
      host: { template: '<rxap-footer /><ng-template rxapFooter><span>Demo App - all rights reserved</span></ng-template><ng-template rxapFooter><span>Imprint | Privacy</span></ng-template>' },
    },
  ],
})
@Component({
    selector: 'rxap-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatToolbarModule, PortalModule]
})
export class FooterComponent {

  protected readonly footerService = inject(FooterService);

  public readonly portals = computed(() => this.footerService.portals());
  public readonly hasPortals = computed(() => this.portals().length > 0);

}
