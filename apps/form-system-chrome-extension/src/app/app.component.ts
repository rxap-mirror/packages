import {
  Component,
  AfterContentChecked
} from '@angular/core';
import { FormDetailsService } from './form-details/form-details.service';
import { FormsService } from './forms.service';
import { FormTemplatesService } from './form-templates.service';

@Component({
  selector:    'rxap-root',
  templateUrl: './app.component.html',
  styleUrls:   [ './app.component.scss' ]
})
export class AppComponent implements AfterContentChecked {

  constructor(
    public readonly formDetails: FormDetailsService,
    public readonly forms: FormsService,
    public readonly formTemplates: FormTemplatesService,
  ) {}

  public ngAfterContentChecked(): void {
    // this.load();
  }

  public load(): void {
    this.formTemplates.load();
  }

}
