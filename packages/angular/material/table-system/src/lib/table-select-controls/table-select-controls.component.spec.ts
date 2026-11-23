import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from '../select-row/tokens';
import { SelectRowService } from '../select-row/select-row.service';
import { TableSelectControlsComponent } from './table-select-controls.component';

describe('TableSelectControlsComponent', () => {
  const windowRef = { close: vi.fn() };

  function setup() {
    windowRef.close.mockClear();
    TestBed.configureTestingModule({
      imports: [TableSelectControlsComponent],
      providers: [
        SelectRowService,
        { provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: { multiple: true } },
        { provide: RXAP_WINDOW_REF, useValue: windowRef },
      ],
    });
    const fixture = TestBed.createComponent(TableSelectControlsComponent);
    fixture.detectChanges();
    return { fixture, loader: TestbedHarnessEnvironment.loader(fixture), service: TestBed.inject(SelectRowService) };
  }

  it('closes without a result on cancel', async () => {
    const { loader } = setup();
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    expect(windowRef.close).toHaveBeenCalledWith();
  });

  it('disables select without selection and closes with the selection', async () => {
    const { loader, service, fixture } = setup();
    const select = await loader.getHarness(MatButtonHarness.with({ text: 'Select' }));
    expect(await select.isDisabled()).toBe(true);
    service.selectionModel.select({ a: 1 });
    fixture.detectChanges();
    expect(await select.isDisabled()).toBe(false);
    await select.click();
    expect(windowRef.close).toHaveBeenCalledWith([{ a: 1 }]);
  });
});
