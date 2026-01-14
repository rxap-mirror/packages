import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  DataGridOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizeDataGridOptions,
  NormalizedDataGridOptions,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import { DataGridComponentOptions } from './schema';

export interface NormalizedDataGridComponentOptions
  extends Readonly<Normalized<Omit<DataGridComponentOptions, keyof AngularOptions | keyof DataGridOptions | 'itemList' | 'propertyList'>> & NormalizedAngularOptions & NormalizedDataGridOptions> {
  dataSourceClassName: string;
  dataSourceFileName: string;
  componentName: string;
  controllerName: string;
  name: string;
}

export function NormalizeDataGridComponentOptions(
  options: Readonly<DataGridComponentOptions>,
): NormalizedDataGridComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedDataGridOptions = NormalizeDataGridOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const {
    name,
    directory,
    nestModule,
  } = normalizedAngularOptions;
  const componentName = CoerceSuffix(dasherize(name), '-data-grid');
  const controllerName = BuildNestControllerName({
    controllerName: name,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedDataGridOptions,
    controllerName,
    directory: join(directory ?? '', componentName),
    componentName,
    dataSourceClassName: CoerceSuffix(classify(name), 'DataGridDataSource'),
    dataSourceFileName: CoerceSuffix(name, '-data-grid.data-source'),
  });
}