import { existsSync, readFileSync } from 'fs';

export function LoadKeysFromFile(projectName: string): { read?: string | null, write?: string | null } {

  if (!projectName) {
    console.log('Could not load keys from file. Project name is not set');
    return {};
  }

  if (process.env.LOCALAZY_KEY_MAP) {
    const filePath = process.env.LOCALAZY_KEY_MAP;
    console.log('Load keys from file', filePath);
    if (!existsSync(filePath)) {
      console.log('File does not exist', filePath);
      return {};
    }
    const content = readFileSync(filePath, 'utf-8');
    try {
      const map = JSON.parse(content);
      if (typeof map === 'object' && map[projectName]) {
        if (typeof map[projectName] === 'string') {
          return { read: null, write: map[projectName] };
        }
        if (typeof map[projectName] === 'object') {
          return map[projectName];
        }
      }
      console.log(`Could not find project '${projectName}' in file '${filePath}' with map`, JSON.stringify(map, null, 2));
      return {};
    } catch (e) {
      console.log(`Could not parse file '${filePath}' with content`, content);
      return {};
    }
  }

  console.log('Could not load keys from file. LOCALAZY_KEY_MAP is not set');
  return {};

}
