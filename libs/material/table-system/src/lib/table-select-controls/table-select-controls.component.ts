import {
  ChangeDetectionStrategy,
  Component,
  Inject
} from '@angular/core';
import type { WindowRef } from '@rxap/window-system';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectRowService } from '../select-row/select-row.service';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  // TODO : rn selector
  selector:        'mfd-table-select-controls',
  templateUrl:     './table-select-controls.component.html',
  styleUrls:       [ './table-select-controls.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-table-select-controls' },
  standalone:      true,
  imports:         [
    FlexModule,
    MatButtonModule,
    AsyncPipe
  ]
})
export class TableSelectControlsComponent {
  public hasNotSelected$: Observable<boolean>;

  constructor(
    private readonly selectRows: SelectRowService<any>,
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef
  ) {
    this.hasNotSelected$ = this.selectRows.selectedRows$.pipe(
      map((selected) => selected.length === 0)
    );
  }

  public cancel() {
    this.windowRef.close();
  }

  public select() {
    this.windowRef.close(this.selectRows.selectedRows);
  }
}
