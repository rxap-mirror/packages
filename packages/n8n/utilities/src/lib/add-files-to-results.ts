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
