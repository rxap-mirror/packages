import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { FooterService } from '@rxap/services';
import { PortalModule } from '@angular/cdk/portal';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NgIf,
  NgFor,
  AsyncPipe
} from '@angular/common';

@Component({
  selector:        'rxap-footer',
  templateUrl:     './footer.component.html',
  styleUrls:       [ './footer.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports:         [ NgIf, MatToolbarModule, NgFor, PortalModule, AsyncPipe ]
})
export class FooterComponent {

  constructor(
    public readonly footerService: FooterService
  ) {}

}
