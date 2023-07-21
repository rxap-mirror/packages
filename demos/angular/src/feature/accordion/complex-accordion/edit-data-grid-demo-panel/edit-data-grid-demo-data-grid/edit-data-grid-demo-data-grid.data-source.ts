import {
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import { Injectable } from '@angular/core';

@Injectable()
@RxapStaticDataSource({
  id: 'edit-data-grid-demo',
  data: {},
})
export class EditDataGridDemoDataGridDataSource extends StaticDataSource {
}
