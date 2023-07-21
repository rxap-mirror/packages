import {
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import { Injectable } from '@angular/core';

@Injectable()
@RxapStaticDataSource({
  id: 'edit-data-grid-collection-demo',
  data: [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ],
})
export class EditDataGridCollectionDemoDataGridDataSource extends StaticDataSource {
}
