import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Optional,
} from '@angular/core';
import { RXAP_LAYOUT_APPS_GRID } from '../../tokens';
import { ConfigService } from '@rxap/config';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
} from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import {
  NgClass,
  NgFor,
  NgIf,
  NgStyle,
} from '@angular/common';

export interface AppsButtonGridItem {
  image: string;
  label: string;
  href: string;
  empty?: false;
}

export interface EmptyAppsButtonGridItem {
  empty: true;
  href?: undefined;
  label?: undefined;
  image?: undefined;
}

@Component({
  selector: 'rxap-apps-button',
  templateUrl: './apps-button.component.html',
  styleUrls: [ './apps-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'rxap-apps-button' },
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    CdkOverlayOrigin,
    MatIconModule,
    CdkConnectedOverlay,
    ExtendedModule,
    NgStyle,
    NgFor,
    NgClass,
    FlexModule,
  ],
})
export class AppsButtonComponent {
  public get gridWithPadding(): Array<
    AppsButtonGridItem | EmptyAppsButtonGridItem
  > {
    const gridWithPadding: Array<AppsButtonGridItem | EmptyAppsButtonGridItem> =
      this.grid.slice();
    while (gridWithPadding.length % this.columns !== 0) {
      gridWithPadding.push({ empty: true });
    }
    return gridWithPadding;
  }

  public get columns() {
    if (this.grid.length < 4) {
      return 1;
    }
    if (this.grid.length < 6) {
      return 2;
    }
    return 3;
  }

  public isOpen = false;
  public grid: Array<AppsButtonGridItem> = [];

  constructor(
    @Optional()
    @Inject(RXAP_LAYOUT_APPS_GRID)
      grid: any,
    @Inject(ConfigService)
    private readonly config: ConfigService,
  ) {
    this.grid = grid ?? this.config.get('navigation.apps') ?? [];
  }
}
