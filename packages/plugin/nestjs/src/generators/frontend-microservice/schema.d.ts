import { InitApplicationGeneratorSchema } from '../init-application/schema';

export interface FrontendMicroserviceGeneratorSchema extends InitApplicationGeneratorSchema {
  frontend: string;
  feature: string;
}
