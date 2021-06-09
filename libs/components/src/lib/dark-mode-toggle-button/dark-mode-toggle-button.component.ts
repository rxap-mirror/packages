import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ThemeService } from '@rxap/services';

@Component({
  selector: 'rxap-dark-mode-toggle-button',
  templateUrl: './dark-mode-toggle-button.component.html',
  styleUrls: ['./dark-mode-toggle-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rxap-dark-mode-toggle-button' },
})
export class DarkModeToggleButtonComponent {
  constructor(
    @Inject(ThemeService)
    public readonly theme: ThemeService
  ) {}
}
