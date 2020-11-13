import {
  Project,
  SourceFile
} from 'ts-morph';

export interface HandleFormProviders {
  handleFormProviders({ options, project, sourceFile }: { options: Record<string, any>, project: Project, sourceFile: SourceFile }): void;
}
