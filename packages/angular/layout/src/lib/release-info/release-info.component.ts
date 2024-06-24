import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
  DetermineReleaseName,
  EnvironmentComponent,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import { RXAP_RELEASE_INFO_MODULE } from '../tokens';
import { coerceArray } from '@rxap/utilities';

@Component({
  selector: 'rxap-release-info',
  standalone: true,
  imports: [
    MatButton,
  ],
  templateUrl: './release-info.component.html',
  styleUrl: './release-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseInfoComponent {

  public readonly modules = coerceArray(inject(RXAP_RELEASE_INFO_MODULE, { optional: true }));
  public readonly release = DetermineReleaseName(inject(RXAP_ENVIRONMENT));

  private readonly dialog = inject(MatDialog);

  openEnvironmentInfo() {
    this.dialog.open(EnvironmentComponent, {
      closeOnNavigation: true,
    });
  }

}
