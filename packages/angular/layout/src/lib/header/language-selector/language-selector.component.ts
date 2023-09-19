import {
  KeyValuePipe,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { StopPropagationDirective } from '@rxap/directives';
import { LanguageSelectorService } from '@rxap/ngx-localize';

@Component({
  selector: 'rxap-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: [ './language-selector.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatFormFieldModule,
    StopPropagationDirective,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    KeyValuePipe,
  ],
})
export class LanguageSelectorComponent {
  constructor(public readonly language: LanguageSelectorService) {
  }

}
