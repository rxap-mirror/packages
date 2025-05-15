import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatFormField,
  MatHint,
  MatLabel,
} from '@angular/material/form-field';
import {
  MatOption,
  MatSelect,
} from '@angular/material/select';
import { StopPropagationDirective } from '@rxap/directives';
import { LanguageSelectorService } from '@rxap/ngx-localize';

@Component({
    selector: 'rxap-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatFormField,
        StopPropagationDirective,
        MatSelect,
        FormsModule,
        MatOption,
        KeyValuePipe,
        MatLabel,
        MatHint,
    ]
})
export class LanguageSelectorComponent {

  private readonly language = inject(LanguageSelectorService);

  public readonly hasLanguages = computed(() => this.language.hasLanguages());
  public readonly languages = computed(() => this.language.languages());
  public readonly selectedLanguage = computed(() => this.language.selectedLanguage());

  readonly autoReload = input(true);

  selectLanguage(language: string) {
    return this.language.setLanguage(language, this.autoReload());
  }

}
