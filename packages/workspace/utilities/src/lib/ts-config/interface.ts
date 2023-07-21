import { CompileOnSaveDefinition } from './compile-on-save-definition';
import { CompilerOptionsDefinition } from './compiler-options-definition';
import { ExcludeDefinition } from './exclude-definition';
import { ExtendsDefinition } from './extends-definition';
import { FilesDefinition } from './files-definition';
import { IncludeDefinition } from './include-definition';
import { ReferencesDefinition } from './references-definition';
import { TsNodeDefinition } from './ts-node-definition';
import { TypeAcquisitionDefinition } from './type-acquisition-definition';

export type TsConfigJson =
  CompilerOptionsDefinition
  & CompileOnSaveDefinition
  & TypeAcquisitionDefinition
  & ExtendsDefinition
  & TsNodeDefinition
  & FilesDefinition
  & ExcludeDefinition
  & IncludeDefinition
  & ReferencesDefinition;
