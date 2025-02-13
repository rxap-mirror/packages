export interface DocumentationGeneratorSchema {
  /** A list of projects where the documentation should be generated */
  projects?: Array<string>;
  /** If true, the openai api is not used */
  offline?: boolean;
  /** A filter to select the files to be processed */
  filter?: string;
  /** The openai api key */
  openaiApiKey?: string;
  /** The openai organization id */
  openaiOrgId?: string;
  /** The openai project id */
  openaiProjectId?: string;
  project?: string;
}
