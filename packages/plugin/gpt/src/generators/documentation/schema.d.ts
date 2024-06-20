export interface DocumentationGeneratorSchema {
  openaiApiKey?: string;
  openaiOrgId?: string;
  openaiProjectId?: string;
  projects: string[];
  offline: boolean;
  filter: string;
}
