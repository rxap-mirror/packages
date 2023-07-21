import {
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import { Injectable } from '@angular/core';

@Injectable()
@RxapStaticDataSource({
  id: 'data-grid-demo',
  data: {},
})
export class DataGridDemoDataGridDataSource extends StaticDataSource {
}
