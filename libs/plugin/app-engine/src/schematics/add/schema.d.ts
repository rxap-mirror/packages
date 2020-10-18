export interface AddSchema {
  service: string;
  automaticScaling?: boolean;
  maxInstances?: number;
  minInstances?: number;
  project: string;
}
