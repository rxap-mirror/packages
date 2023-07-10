export interface SchematicGeneratorSchema {
  project: string;
  name: string;
  description?: string;
  skipFormat?: boolean;
}
