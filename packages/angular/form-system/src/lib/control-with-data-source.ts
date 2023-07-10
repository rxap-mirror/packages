import {BaseDataSource} from '@rxap/data-source';
import {UseDataSourceSettings} from './decorators/use-data-source';

export interface ControlWithDataSource<Source = any, Target = any> {
  setDataSource(name: string, dataSource: BaseDataSource, settings?: UseDataSourceSettings<Source, Target>): void;
}
