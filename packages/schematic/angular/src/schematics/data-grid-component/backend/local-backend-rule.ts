import { chain } from '@angular-devkit/schematics';
import { CoerceDataSourceClass } from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { Writers } from 'ts-morph';
import { NormalizedDataGridComponentOptions } from '../normalize-data-grid-component-options';

export function localBackendRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    shared,
    directory,
    name,
    collection,
  } = normalizedOptions;

  return chain([
    () => console.log('Coerce data grid data source class'),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      decorator: {
        name: 'RxapStaticDataSource',
        moduleSpecifier: '@rxap/data-source',
        argument: Writers.object({
          id: w => w.quote(name),
          data: collection ? '[]' : '{}',
        }),
      },
      extends: {
        name: 'StaticDataSource',
        moduleSpecifier: '@rxap/data-source',
      },
      name: CoerceSuffix(name, '-data-grid'),
    }),
  ]);
}