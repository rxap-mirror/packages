import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceFile } from './coerce-file';
import { deepMerge } from './deep-merge';

export type EnvFile = Record<string, string | number | boolean>

export function EnvMapToString(map: EnvFile): string {
  return Object.entries(map).map(([ name, value ]) => {

    let stringValue = `${ value }`;
    if (typeof value === 'string') {
      if (value.includes(' ') || !isNaN(Number(value)) || value === 'true' || value === 'false') {
        stringValue = `"${ value }"`;
      }
    }

    return `${ name }=${ stringValue }`;
  }).join('\n') + '\n';
}

export function StringToEnvMap(content: string): EnvFile {

  return content
    // split on new line
    .split(/\r?\n|\r/)
    // filter comments
    .filter(line => /^[^#]/.test(line))
    // needs equal sign
    .filter(line => /=/i.test(line))
    // turn lines into plain object
    .reduce((memo, line) => {
      // pull out key/values (value can have spaces, remove quotes)
      const kv = line.match(/^([^=]+)=(.*)$/);
      if (kv) {
        const key = kv[1].trim();
        const val = kv[2].trim().replace(/['"]/g, '');

        const isString = kv[2].trim().match(/^['"].*['"]$/);

        let value: string | number | boolean;

        if (isString) {
          value = val;
        } else {

          switch (val.toLowerCase()) {

            case 'true':
              value = true;
              break;

            case 'false':
              value = false;
              break;

            default:
              if (!isNaN(Number(val))) {
                value = Number(val);
              } else {
                value = val;
              }

          }
        }

        memo[key] = value;
      } else {
        console.warn(`Could not parse env line '${ line }'`);
      }
      return memo;
    }, {} as Record<string, string | boolean | number>);

}

export function CoerceEnvFile(tree: Tree, content: EnvFile, filePath = '.env'): void {

  CoerceFile(tree, filePath, EnvMapToString(content));

}

export function MergeWithEnvFile(content: EnvFile, filePath = '.env'): Rule {
  return tree => {

    CoerceEnvFile(tree, content, filePath);

    const env = GetEnvFile(tree, filePath);

    const newContent = deepMerge(env, content);

    WriteEnvFile(tree, newContent, filePath);

  };
}

export function WriteEnvFile(tree: Tree, content: EnvFile, filePath = '.env'): void {

  if (!tree.exists(filePath)) {
    tree.create(filePath, '');
  }

  tree.overwrite(filePath, EnvMapToString(content));

}

export function GetEnvFile(tree: Tree, filePath = '.env'): EnvFile {

  if (!tree.exists(filePath)) {
    throw new SchematicsException(`Could not find a env file in '${ filePath }'.`);
  }

  return StringToEnvMap(tree.read(filePath)!.toString());

}
