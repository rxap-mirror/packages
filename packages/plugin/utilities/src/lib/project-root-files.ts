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

export function hasFileInProjectRoot(context: ExecutorContext, fileName: string) {
  const projectRoot = GetProjectRoot(context);
  // filePath is already absolute (joined with context.root); re-joining with
  // projectRoot produced a nonsense path that never existed
  const filePath = join(context.root, projectRoot, fileName);
  return existsSync(filePath);
}
