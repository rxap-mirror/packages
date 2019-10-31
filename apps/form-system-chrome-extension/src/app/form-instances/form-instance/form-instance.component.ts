import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import { FormInstanceId } from '@rxap/form-system';
import { FormInstancesService } from '../../form-instances.service';
import { Observable } from 'rxjs';
import { Required } from '@rxap/utilities';

@Component({
  selector:    'rxap-form-instance',
  templateUrl: './form-instance.component.html',
  styleUrls:   [ './form-instance.component.scss' ]
})
export class FormInstanceComponent implements OnInit {

  @Input() @Required public instanceId: FormInstanceId;

  public value$!: Observable<any>;
  public errors$!: Observable<any>;

  constructor(public formInstances: FormInstancesService) { }

  ngOnInit() {
    this.value$  = this.formInstances.getInstanceValue$(this.instanceId);
    this.errors$ = this.formInstances.getInstanceErrors$(this.instanceId);
  }

}
