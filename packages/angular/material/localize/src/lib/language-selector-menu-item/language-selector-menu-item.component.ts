import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MatMenuItem } from '@angular/material/menu';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'rxap-language-selector-menu-item',
  standalone: true,
  imports: [ MatMenuItem, LanguageSelectorComponent ],
  templateUrl: './language-selector-menu-item.component.html',
  styleUrl: './language-selector-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorMenuItemComponent {}
