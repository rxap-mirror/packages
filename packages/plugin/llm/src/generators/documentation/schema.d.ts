export interface DocumentationGeneratorSchema {
  path?: string;
  /** The openai api key */
  apiKey?: string;
  /** The openai organization id */
  orgId?: string;
  /** The openai project id */
  projectId?: string;
  model?: string;
  baseUrl?: string;
}
