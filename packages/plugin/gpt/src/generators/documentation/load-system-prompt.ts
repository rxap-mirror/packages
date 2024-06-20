import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';

export function loadSystemPrompt(name: string) {
  const filePath = join(__dirname, 'system-prompts', `${ name }.txt`);
  if (!existsSync(filePath)) {
    throw new Error(`Can not find system prompt file '${ filePath }'`);
  }
  return readFileSync(filePath).toString();
}
