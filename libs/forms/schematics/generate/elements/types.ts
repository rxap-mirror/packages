import {
  SourceFile,
  Project
} from 'ts-morph';
import { GenerateSchema } from '../schema';

export interface ToValueContext {
  sourceFile: SourceFile;
  project: Project,
  options: GenerateSchema
}
