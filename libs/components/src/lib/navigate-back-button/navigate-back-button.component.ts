import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector:        'rxap-navigate-back-button',
  templateUrl:     './navigate-back-button.component.html',
  styleUrls:       [ './navigate-back-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-navigate-back-button' },
  standalone:      true,
  imports:         [ FlexModule, MatLegacyButtonModule, MatIconModule ]
})
export class NavigateBackButtonComponent {

  public navigateBack() {
    window.history.back();
  }

}
