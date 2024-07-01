import type { IconConfig } from '@rxap/utilities';

export interface InitFeatureGeneratorSchema {
  project: string;
  name: string;
  overwrite?: boolean;
  navigation?: {
    label: string;
    icon?: IconConfig;
  };
  skipFormat?: boolean;
  apiStatusCheck?: boolean;
}
