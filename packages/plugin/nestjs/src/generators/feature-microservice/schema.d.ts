import { InitApplicationGeneratorSchema } from '../init-application/schema';

export interface FeatureMicroserviceGeneratorSchema extends InitApplicationGeneratorSchema {
  feature: string;
}
