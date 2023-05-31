import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { ThemeService } from '@rxap/services';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { StopPropagationDirective } from '@rxap/directives';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector:        'rxap-dark-mode-toggle-button',
  templateUrl:     './dark-mode-toggle-button.component.html',
  styleUrls:       [ './dark-mode-toggle-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-dark-mode-toggle-button' },
  standalone:      true,
  imports:         [
    MatLegacyButtonModule,
    StopPropagationDirective,
    NgIf,
    MatIconModule
  ]
})
export class DarkModeToggleButtonComponent {
  constructor(
    @Inject(ThemeService)
    public readonly theme: ThemeService
  ) {}
}
