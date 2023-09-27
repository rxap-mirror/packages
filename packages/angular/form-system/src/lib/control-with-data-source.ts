import { DataSource } from '@rxap/pattern';
import { UseDataSourceSettings } from './decorators/use-data-source';

export interface ControlWithDataSource<Source = any, Target = any> {
  setDataSource(name: string, dataSource: DataSource, settings?: UseDataSourceSettings<Source, Target>): void;
}
