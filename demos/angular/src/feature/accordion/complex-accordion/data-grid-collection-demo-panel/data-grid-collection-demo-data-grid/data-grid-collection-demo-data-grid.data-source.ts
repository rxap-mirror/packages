import {
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import { Injectable } from '@angular/core';

@Injectable()
@RxapStaticDataSource({
  id: 'data-grid-collection-demo',
  data: [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ],
})
export class DataGridCollectionDemoDataGridDataSource extends StaticDataSource {
}
