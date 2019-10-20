import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Inject,
  Optional,
  OnInit,
  isDevMode
} from '@angular/core';
import { RXAP_FORM_ID } from '../../tokens';
import { FormInstanceFactory } from '../../form-instance-factory';
import { FormInstance } from '../../form-instance';


@Component({
  selector: 'rxap-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCardComponent implements OnInit {

  @Input() public formId: string;

  public instance: FormInstance<any>;

  public isDevMode = isDevMode();

  constructor(
    @Inject(RXAP_FORM_ID) @Optional() formId: string | null = null,
    public readonly formInstanceFactory: FormInstanceFactory,
  ) {
    this.formId = formId;
  }

  public ngOnInit(): void {
    this.instance = this.formInstanceFactory.buildInstance(this.formId);
  }

}
