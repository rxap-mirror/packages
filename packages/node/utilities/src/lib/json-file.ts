import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';

export function jsonFile<T = Record<string, unknown>>(jsonFilePath: string): T {
  if (!existsSync(jsonFilePath)) {
    throw new Error(`The file ${ jsonFilePath } does not exist`);
  }
  const content = readFileSync(jsonFilePath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`Could not parse the file ${ jsonFilePath } to an json object: ${ e.message }`);
  }
}

export function writeJsonFile<T>(jsonFilePath: string, data: T) {
  writeFileSync(jsonFilePath, JSON.stringify(data, null, 2) + '\n');
}
