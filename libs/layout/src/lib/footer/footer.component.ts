import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { FooterService } from '@rxap/services';

@Component({
  selector:        'rxap-footer',
  templateUrl:     './footer.component.html',
  styleUrls:       [ './footer.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {

  constructor(
    public readonly footerService: FooterService
  ) {}

}
