import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'rxap-authentication-container',
  templateUrl: './authentication-container.component.html',
  styleUrls: [ './authentication-container.component.scss' ],
  standalone: true,
  imports: [
    RouterOutlet,
  ],
})
export class AuthenticationContainerComponent {

}
