import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Inject,
  Optional,
  OnInit,
  Injector,
  Output,
  EventEmitter
} from '@angular/core';
import {
  RXAP_FORM_ID,
  RXAP_FORM_INSTANCE_ID
} from '../../tokens';
import { FormInstanceFactory } from '../../form-instance-factory';
import {
  FormInstance,
  FormInstanceId
} from '../../form-instance';
import { Required } from '@rxap/utilities';
import { FormInvalidSubmitService } from '../../form-invalid-submit.service';
import { FormValidSubmitService } from '../../form-valid-submit.service';
import { FormLoadService } from '../../form-load.service';


@Component({
  selector: 'rxap-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCardComponent implements OnInit {

  @Input() @Required public formId!: string;
  @Input() public instanceId!: FormInstanceId;

  @Output() public submitted = new EventEmitter<any>();

  public instance!: FormInstance<any>;

  constructor(
    @Inject(RXAP_FORM_ID) @Optional() formId: string | null                      = null,
    @Inject(RXAP_FORM_INSTANCE_ID) @Optional() instanceId: FormInstanceId | null = null,
    public readonly formInstanceFactory: FormInstanceFactory,
    public readonly formInvalidSubmit: FormInvalidSubmitService<any>,
    public readonly formValidSubmit: FormValidSubmitService<any>,
    public readonly formLoad: FormLoadService<any>,
    public readonly injector: Injector
  ) {
    if (formId) {
      this.formId = formId;
    }
    if (instanceId) {
      this.instanceId = instanceId || this.formId;
    }
  }

  public ngOnInit(): void {
    if (!this.instanceId) {
      this.instanceId = this.formId;
    }
    this.instance = this.formInstanceFactory.buildInstance(
      this.formId,
      this.instanceId,
      this.injector,
      this.formInvalidSubmit,
      this.formValidSubmit,
      this.formLoad
    );
  }

}
