import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Showcase } from '@ng-prism/core';

@Showcase<AuthenticationContainerComponent>({
  title: 'Authentication Container',
  category: 'Authentication',
  description: 'Full page layout of the authentication pages: a colored header area and the centered content. The authentication routes are rendered in the `router-outlet`, other content can be projected.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    { name: 'Default' },
    { name: 'With login', description: 'The login form projected into the container.', template: '<rxap-login />' },
    { name: 'With reset password', description: 'The reset password form projected into the container.', template: '<rxap-reset-password />' },
  ],
})
@Component({
    selector: 'rxap-authentication-container',
    templateUrl: './authentication-container.component.html',
    styleUrls: ['./authentication-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterOutlet,
    ]
})
export class AuthenticationContainerComponent {

}
