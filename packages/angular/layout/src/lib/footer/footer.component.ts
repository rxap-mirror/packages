import { PortalModule } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FooterService } from '../footer.service';

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
