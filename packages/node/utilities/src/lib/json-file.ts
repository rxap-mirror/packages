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

export async function jsonFileWithRetry<T = Record<string, unknown>>(path: string, retries = 3, sleep = 3000): Promise<T> {
  if (!existsSync(path)) {
    throw new Error(`Cannot parse json object. File ${ path } not found`);
  }
  let retryCount = 0;
  let lastError: Error | undefined;
  do {
    try {
      return jsonFile<T>(path);
    } catch (e: any) {
      lastError = e;
      retryCount++;
      if (retryCount < retries) {
        await new Promise(resolve => setTimeout(resolve, sleep * retryCount));
      }
    }
  } while (retryCount < retries);
  throw new Error(`Failed to parse json file ${ path }: ${ lastError?.message }`);
}

export function writeJsonFile<T>(jsonFilePath: string, data: T) {
  writeFileSync(jsonFilePath, JSON.stringify(data, null, 2) + '\n');
}
