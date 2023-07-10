import {ExecutorContext} from '@nx/devkit';
import {GetProjectRoot} from './project';
import {join} from 'path';
import {existsSync, readFileSync, writeFileSync} from 'fs';

export function readFileFromProjectRoot(context: ExecutorContext, fileName: string, requiredOrDefaultContent: string | true = '') {
  const projectRoot = GetProjectRoot(context);
  const filePath = join(projectRoot, fileName);
  if (!existsSync(filePath)) {
    if (requiredOrDefaultContent === true) {
      throw new Error(`The file ${filePath} not exists!`);
    }
    return requiredOrDefaultContent;
  }
  return readFileSync(filePath, 'utf-8');
}

export function writeFileToProjectRoot(context: ExecutorContext, fileName: string, content: string) {
  const projectRoot = GetProjectRoot(context);
  const filePath = join(projectRoot, fileName);
  writeFileSync(filePath, content);
}
