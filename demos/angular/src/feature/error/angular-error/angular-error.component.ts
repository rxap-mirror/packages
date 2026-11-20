
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rxap-angular-error',
    imports: [MatButtonModule],
    templateUrl: './angular-error.component.html',
    styleUrls: ['./angular-error.component.scss']
})
export class AngularErrorComponent {
  triggerError() {
    throw new Error('Angular Error');
  }
}

export default AngularErrorComponent;
