import { Injectable } from '@angular/core';
import { PortService } from './port.service';
import {
  filter,
  tap
} from 'rxjs/operators';
import { unique } from '@rxap/utilities';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  public formIds: string[] = [];

  constructor(public readonly portService: PortService) {
    console.log('FormsService');
    this.portService.receive$.pipe(
      filter(payload => payload.formId),
      tap(payload => this.formIds = [ payload.formId, ...this.formIds ].filter(unique()))
    ).subscribe();
  }

}
