import { FormDefinition } from '@rxap/forms';
import { RxapFormSystemError } from '../error';
import { FormSystemMetadataKeys } from '../decorators/metadata-keys';
import { UseDataSourceValue } from '../decorators/use-data-source';
import { getMetadata } from '@rxap/reflect-metadata';

export class ExtractDataSourcesMixin {

  protected extractDataSources(formDefinition: FormDefinition, controlId: string): Map<string, UseDataSourceValue> {
    const map = getMetadata<Map<string, Map<string, UseDataSourceValue>>>(
      FormSystemMetadataKeys.DATA_SOURCES,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError('Could not extract the use data source map from the form definition instance', '');
    }

    if (!map.has(controlId)) {
      throw new RxapFormSystemError('A use data source definition does not exists in the form definition metadata', '');
    }

    return map.get(controlId)!;
  }

}
