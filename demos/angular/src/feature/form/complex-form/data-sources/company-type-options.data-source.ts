import { Injectable } from '@angular/core';
import {
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import { ControlOptions } from '@rxap/utilities';

@Injectable()
@RxapStaticDataSource({
      id: 'company-type-options',
      data: [{
        value: 1,
        display: 'AG'
      },{
        value: 2,
        display: 'GmbH'
      },]
    })
export class CompanyTypeOptionsDataSource extends StaticDataSource<ControlOptions> {
}
