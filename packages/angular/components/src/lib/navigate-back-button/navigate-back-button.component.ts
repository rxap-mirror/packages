import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { FlexModule } from "@angular/flex-layout";

@Component({
  selector: 'rxap-navigate-back-button',
  templateUrl: './navigate-back-button.component.html',
  styleUrls: ['./navigate-back-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {class: 'rxap-navigate-back-button'},
  standalone: true,
  imports: [FlexModule, MatButtonModule, MatIconModule],
})
export class NavigateBackButtonComponent {

  public navigateBack() {
    window.history.back();
  }

}
