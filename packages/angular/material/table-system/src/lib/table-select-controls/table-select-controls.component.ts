import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { WindowRef } from '@rxap/window-system';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import { map } from 'rxjs/operators';
import { SelectRowService } from '../select-row/select-row.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'rxap-table-select-controls',
    templateUrl: './table-select-controls.component.html',
    styleUrls: ['./table-select-controls.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
    ]
})
export class TableSelectControlsComponent {
  private readonly selectRows = inject<SelectRowService<any>>(SelectRowService);
  private readonly windowRef = inject<WindowRef>(RXAP_WINDOW_REF);

  public readonly hasNotSelected = toSignal(
    this.selectRows.selectedRows$.pipe(
      map((selected) => selected.length === 0),
    ),
    { initialValue: true },
  );

  public cancel() {
    this.windowRef.close();
  }

  public select() {
    this.windowRef.close(this.selectRows.selectedRows);
  }
}
