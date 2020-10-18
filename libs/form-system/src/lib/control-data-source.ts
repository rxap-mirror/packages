import {
  BaseDataSource,
  BaseDataSourceMetadata,
  RXAP_DATA_SOURCE_METADATA,
} from '@rxap/data-source';
import {
  Injectable,
  Inject,
  InjectionToken,
  Optional,
} from '@angular/core';
import { AbstractControl } from '@rxap/forms';
import {
  startWith,
  shareReplay,
  distinctUntilChanged,
} from 'rxjs/operators';
import { equals } from 'ramda';

export const RXAP_FORM_CONTROL_SOURCE = new InjectionToken('rxap/forms/data-source');

@Injectable()
export class ControlDataSource extends BaseDataSource {

  constructor(
    @Inject(RXAP_FORM_CONTROL_SOURCE)
    private readonly control: AbstractControl,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: BaseDataSourceMetadata | null = null,
  ) {
    super(metadata);
  }

  public init() {
    if (this._initialised) {
      return;
    }
    super.init();

    console.log(this.control);

    this._data$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      distinctUntilChanged((a, b) => equals(a, b)),
      shareReplay(1),
    );
  }

}

export function controlDataSource(control: AbstractControl): ControlDataSource {
  // TODO : remove as any (wait for @rxap/forms update)
  return new ControlDataSource(control, { id: (control as any).controlId });
}
