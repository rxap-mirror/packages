import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { GetProjectRoot } from './project';

export function readFileFromProjectRoot(
  context: ExecutorContext,
  fileName: string,
  requiredOrDefaultContent: string | true = '',
) {
  const projectRoot = GetProjectRoot(context);
  const filePath = join(context.root, projectRoot, fileName);
  if (!existsSync(filePath)) {
    if (requiredOrDefaultContent === true) {
      throw new Error(`The file ${ filePath } not exists!`);
    }
    return requiredOrDefaultContent;
  }
  return readFileSync(filePath, 'utf-8');
}

export function writeFileToProjectRoot(context: ExecutorContext, fileName: string, content: string) {
  const projectRoot = GetProjectRoot(context);
  const filePath = join(context.root, projectRoot, fileName);
  writeFileSync(filePath, content);
}
