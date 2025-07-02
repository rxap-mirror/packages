import {
  ClientConfiguration,
  UserClientConfigurationParams
} from '@openfga/sdk/dist/client';


export interface CustomOpenFgaOptions {
  retryInterval?: number;
  maxStartupTime?: number;
}

export type OpenFgaOptions = (ClientConfiguration | UserClientConfigurationParams) & CustomOpenFgaOptions;
