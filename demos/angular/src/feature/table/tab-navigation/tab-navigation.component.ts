import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rxap-tab-navigation',
    imports: [RouterOutlet, MatTabsModule, RouterLink],
    templateUrl: './tab-navigation.component.html',
    styleUrls: ['./tab-navigation.component.scss']
})
export default class TabNavigationComponent {}
