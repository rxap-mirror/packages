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

@Component({
  selector: 'rxap-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbar,
    MatToolbarRow,
    CdkPortalOutlet,
  ],
})
export class HeaderComponent {

  public readonly color = input<ThemePalette>();

  private readonly headerService = inject(HeaderService);

  public readonly portals = computed(() => this.headerService.portals());
  public readonly hasPortals = computed(() => this.portals().length > 0);

}
