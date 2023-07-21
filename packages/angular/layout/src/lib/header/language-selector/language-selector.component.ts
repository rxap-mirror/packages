import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { StopPropagationDirective } from '@rxap/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  KeyValuePipe,
  NgFor,
  NgIf,
} from '@angular/common';
import { LanguageSelectorService } from '../../language-selector.service';

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
