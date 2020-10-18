import { InjectionToken } from '@angular/core';
import { BaseDataSource } from '@rxap/data-source';
import { PaginatorLike } from './abstract-pagination.data-source';

export const RXAP_PAGINATION_DATA_SOURCE           = new InjectionToken<BaseDataSource<any[]>>('@rxap/data-source/pagination/source');
export const RXAP_PAGINATION_DATA_SOURCE_PAGINATOR = new InjectionToken<PaginatorLike>('@rxap/data-source/pagination/paginator');
