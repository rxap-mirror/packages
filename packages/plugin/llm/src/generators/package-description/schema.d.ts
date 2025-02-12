export interface PackageDescriptionGeneratorSchema {
  project: string;
  /** The openai api key */
  apiKey?: string;
  /** The openai organization id */
  orgId?: string;
  /** The openai project id */
  projectId?: string;
  /** The openai base url */
  baseUrl?: string;
  /** Set the LLM model to be used */
  model?: string;
  overwrite?: boolean;
}
