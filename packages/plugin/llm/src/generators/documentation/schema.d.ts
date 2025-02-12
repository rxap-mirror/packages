export interface DocumentationGeneratorSchema {
  path?: string;
  /** The openai api key */
  openaiApiKey?: string;
  /** The openai organization id */
  openaiOrgId?: string;
  /** The openai project id */
  openaiProjectId?: string;
  model?: string;
}
