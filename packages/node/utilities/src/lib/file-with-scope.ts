import {
  existsSync,
  readFileSync,
} from 'fs';

export function InjectScopeInFilePath(filePath: string, scope?: string): string {
  if (!scope) {
    return filePath;
  }

  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${ filePath }.${ scope }`;
  }

  return `${ filePath.substring(0, lastDotIndex) }.${ scope }${ filePath.substring(lastDotIndex) }`;
}

export function ExistsFileWithScope(path: string, scope?: string): boolean {
  return existsSync(InjectScopeInFilePath(path, scope)) || existsSync(path);
}

export function ReadFileWithScope(path: string, scope?: string, encoding: BufferEncoding = 'utf-8'): string {
  let filePath = InjectScopeInFilePath(path, scope);
  if (!existsSync(filePath)) {
    if (!existsSync(path)) {
      throw new Error(`The file "${ path }" does not exists!`);
    }
    filePath = path;
  }
  return readFileSync(filePath, encoding);
}
