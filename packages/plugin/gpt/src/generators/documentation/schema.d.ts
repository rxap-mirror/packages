export interface DocumentationGeneratorSchema {
  openaiApiKey?: string;
  projects: string[];
  offline: boolean;
  filter: string;
}
