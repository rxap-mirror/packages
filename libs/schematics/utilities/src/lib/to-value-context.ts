import { Project } from 'ts-morph';

export interface ToValueContext<Schema = Record<string, any>> {
  project: Project;
  options: Schema;
}
