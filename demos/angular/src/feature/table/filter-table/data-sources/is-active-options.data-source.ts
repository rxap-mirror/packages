import { RxapStaticDataSource, StaticDataSource } from '@rxap/data-source';
import { ControlOptions } from '@rxap/utilities';
import { Injectable } from '@angular/core';

@Injectable()
@RxapStaticDataSource({
  id: 'is-active-options',
  data: [
    {
      value: true,
      display: 'True',
    },
    {
      value: false,
      display: 'False',
    },
  ],
})
export class IsActiveOptionsDataSource extends StaticDataSource<ControlOptions> {}
