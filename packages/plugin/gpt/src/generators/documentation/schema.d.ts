export interface DocumentationGeneratorSchema {
  project?: string;
  openaiApiKey?: string;
  openaiOrgId?: string;
  openaiProjectId?: string;
  projects: string[];
  offline: boolean;
  filter: string;
}
