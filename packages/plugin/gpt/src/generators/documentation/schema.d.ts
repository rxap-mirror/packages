export interface DocumentationGeneratorSchema {
  openaiApiKey?: string;
  openaiOrganization?: string;
  projects: string[];
  offline: boolean;
  filter: string;
}
