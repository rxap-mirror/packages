import {
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import {
  IBinaryData,
  IBinaryKeyData,
  INodeExecutionData,
} from 'n8n-workflow/dist/Interfaces';
import {
  join,
  relative,
} from 'path';
import type { Readable } from 'stream';

/**
 * Recursively adds files from a directory to the binary data of a result object.
 * Traverses through the directory and its subdirectories, reading files
 * and preparing their binary data to include in the provided result object.
 *
 * @param {string} dir - The directory path to process.
 * @param {string} workDir - The base working directory, used to generate relative file paths.
 * @param {INodeExecutionData & { binary: IBinaryKeyData }} result - The result object to which binary data of files will be added.
 * @param {function} prepareBinaryData - A function that prepares binary data from a file's buffer, file path, and MIME type.
 * It returns a Promise that resolves to a prepared IBinaryData object.
 * @return {Promise<void>} A promise that resolves when all files in the directory and its subdirectories have been processed and their binary data added to the result.
 */
export async function addFilesToResults(
  dir: string,
  workDir: string,
  result: INodeExecutionData & { binary: IBinaryKeyData },
  prepareBinaryData: (binaryData: Buffer | Readable, filePath?: string, mimeType?: string) => Promise<IBinaryData>
) {
  for (const fragment of readdirSync(dir)) {
    const path = join(dir, fragment);
    if (statSync(path).isDirectory()) {
      await addFilesToResults(path, workDir, result, prepareBinaryData);
    } else {
      const buffer = readFileSync(path, null);
      const shortPath = relative(workDir, path);
      const name = shortPath.split('/').join('_').split('.').join('_');
      result.binary[name] = await prepareBinaryData(buffer, path);
    }
  }
}
