import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MatMenuItem } from '@angular/material/menu';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { Showcase } from '@ng-prism/core';

@Showcase<LanguageSelectorMenuItemComponent>({
  title: 'Language Selector Menu Item',
  category: 'Localize',
  description: 'Menu item that contains the language selector. Use it inside of a `mat-menu`, for example in the user menu of the header.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-language-selector-menu-item',
    imports: [MatMenuItem, LanguageSelectorComponent],
    templateUrl: './language-selector-menu-item.component.html',
    styleUrl: './language-selector-menu-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorMenuItemComponent {}
