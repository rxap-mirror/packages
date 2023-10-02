import { InitApplicationGeneratorSchema } from '../init-application/schema';

export interface MicroserviceGeneratorSchema extends InitApplicationGeneratorSchema {
  name: string;
  directory: string;
}
