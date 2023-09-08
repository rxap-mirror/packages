import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rxap-angular-error',
  standalone: true,
  imports: [ CommonModule, MatButtonModule ],
  templateUrl: './angular-error.component.html',
  styleUrls: [ './angular-error.component.scss' ],
})
export class AngularErrorComponent {
  triggerError() {
    throw new Error('Angular Error');
  }
}

export default AngularErrorComponent;
