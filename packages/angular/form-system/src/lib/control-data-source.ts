import {
  BaseDataSource,
  BaseDataSourceMetadata,
  RXAP_DATA_SOURCE_METADATA,
} from '@rxap/data-source';
import {
  Inject,
  Injectable,
  InjectionToken,
  isDevMode,
  Optional,
} from '@angular/core';
import { AbstractControl } from '@rxap/forms';
import {
  distinctUntilChanged,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import { equals } from '@rxap/utilities';

export const RXAP_FORM_CONTROL_SOURCE = new InjectionToken(
  'rxap/forms/data-source',
);

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

  public override init() {
    if (this._initialised) {
      return;
    }
    super.init();

    if (isDevMode()) {
      console.log(this.control);
    }

    this._data$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      distinctUntilChanged((a, b) => equals(a, b)),
      shareReplay(1),
    );
  }
}

export function controlDataSource(control: AbstractControl): ControlDataSource {
  // TODO : remove as any (wait for @rxap/forms update)
  return new ControlDataSource(control, {id: (control as any).controlId});
}
