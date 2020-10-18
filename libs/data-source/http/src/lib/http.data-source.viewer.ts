import { KeyValue } from '@rxap/utilities';
import { BaseDataSourceViewer } from '@rxap/data-source';
import { HttpDataSourceOptions } from './http.data-source.options';

export interface HttpDataSourceViewer<PathParams = KeyValue, Body = any | null> extends BaseDataSourceViewer<HttpDataSourceOptions<PathParams, Body>>,
                                                                                        HttpDataSourceOptions<PathParams, Body> {
  realtime?: boolean;
}
