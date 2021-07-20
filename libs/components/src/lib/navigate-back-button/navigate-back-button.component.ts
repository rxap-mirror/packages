import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector:        'rxap-navigate-back-button',
  templateUrl:     './navigate-back-button.component.html',
  styleUrls:       [ './navigate-back-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rxap-navigate-back-button' }
})
export class NavigateBackButtonComponent {

  public navigateBack() {
    window.history.back();
  }

}
