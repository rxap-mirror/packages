import {
  Component,
  OnInit
} from '@angular/core';
import { FormDetailsService } from '../form-details/form-details.service';

@Component({
  selector:    'rxap-form-instances',
  templateUrl: './form-instances.component.html',
  styleUrls:   [ './form-instances.component.scss' ]
})
export class FormInstancesComponent implements OnInit {

  constructor(public formDetails: FormDetailsService) {
    this.formDetails.loadInstanceIds();
  }

  ngOnInit() {

  }

}
