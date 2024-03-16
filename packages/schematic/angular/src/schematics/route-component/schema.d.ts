import { AngularOptions } from '../../lib/angular-options';
import { RouteComponent } from '../../lib/route-component';

export interface RouteComponentOptions extends Omit<AngularOptions, 'name'>, RouteComponent {
}
