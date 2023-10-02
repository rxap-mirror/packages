import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { GetProjectSourceRoot } from './project';

export function ReadFileFromProjectSourceRoot(
  context: ExecutorContext,
  fileName: string,
  requiredOrDefaultContent: string | true = '',
) {
  const projectSourceRoot = GetProjectSourceRoot(context);
  const filePath = join(context.root, projectSourceRoot, fileName);
  if (!existsSync(filePath)) {
    if (requiredOrDefaultContent === true) {
      throw new Error(`The file ${ filePath } not exists!`);
    }
    return requiredOrDefaultContent;
  }
  return readFileSync(filePath, 'utf-8');
}

export function WriteFileToProjectSourceRoot(context: ExecutorContext, fileName: string, content: string) {
  const projectSourceRoot = GetProjectSourceRoot(context);
  const filePath = join(context.root, projectSourceRoot, fileName);
  writeFileSync(filePath, content);
}
