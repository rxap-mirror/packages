import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'rxap-sidenav-toggle-button',
  templateUrl: './sidenav-toggle-button.component.html',
  styleUrls: [ './sidenav-toggle-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    MatIconModule,
  ],
})
export class SidenavToggleButtonComponent {

  private readonly layoutComponentService = inject(LayoutService);

  public readonly opened = computed(() => this.layoutComponentService.opened());

  public toggle() {
    this.layoutComponentService.toggleOpened();
  }

}
