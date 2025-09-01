import { HasNestModuleClass } from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import { Project } from 'ts-morph';

export function findModuleFile(project: Project, moduleName: string) {
  return project.getSourceFile(file => HasNestModuleClass(file) && file.getClasses().some(c => c.getName()?.toLowerCase().includes(classify(moduleName).toLowerCase()))) ?? null;
}
