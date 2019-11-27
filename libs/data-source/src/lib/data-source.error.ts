export enum DataSourceErrorTypes {
  PAGE_IS_OUT_OF_BOUND    = 'Specified page is out of bound',
  ILLIGAL_PAGE            = 'ILLIGAL_PAGE',
  NO_DATA_SOURCE_ID       = 'NO_DATA_SOURCE_ID',
  INVALID_PROVIDER_CONFIG = 'INVALID_PROVIDER_CONFIG'
}

export class DataSourceError extends Error {

  constructor(public type: DataSourceErrorTypes, public data: any = null) {
    super(type + '');

    Object.setPrototypeOf(this, DataSourceError.prototype);
  }

}
