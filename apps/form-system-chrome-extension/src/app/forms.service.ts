import { Injectable } from '@angular/core';
import { PortService } from './port.service';
import {
  filter,
  tap
} from 'rxjs/operators';
import { unique } from '@rxap/utilities';
import { FormId } from '@rxap/form-system';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  public formIds: string[] = [];

  constructor(public readonly portService: PortService) {
    console.log('FormsService');
    this.portService.receive$.pipe(
      filter(payload => payload.formId),
      tap(payload => this.addFormId(payload.formId))
    ).subscribe();
  }

  public addFormId(formId: FormId) {
    this.formIds = [ formId, ...this.formIds ].filter(unique())
  }

}
