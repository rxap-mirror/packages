import { ExecutorContext } from '@nx/devkit';
import { execFileSync } from 'child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import {
  basename,
  join,
  resolve,
} from 'path';
import { BuildGeneratorsExecutorSchema } from './schema';

/**
 * ng-packagr only compiles the entry points of a library. The generators of the library
 * (`src/generators/**`) are never compiled and `generators.json` is never copied, so the published
 * package would reference files that do not exist.
 *
 * This executor compiles the generators to CommonJS into a staging directory inside the project and
 * copies `generators.json` and all non-TypeScript generator files (schema.json, templates) next to
 * them. The ng-packagr `assets` copy the staging directory into the package.
 *
 * ng-packagr marks the published package as `"type": "module"`, so a `package.json` with
 * `"type": "commonjs"` is written next to the compiled generators; without it node (and nx) would
 * load the CommonJS output as ESM.
 */
export default async function runExecutor(
  options: BuildGeneratorsExecutorSchema,
  context: ExecutorContext,
) {
  const projectRoot = context.projectsConfigurations?.projects[context.projectName!]?.root;
  if (!projectRoot) {
    throw new Error(`Can not determine the root of the project '${ context.projectName }'`);
  }

  const root = resolve(context.root, projectRoot);
  const tsConfig = join(root, options.tsConfig ?? 'tsconfig.generators.json');
  const outputPath = join(root, options.outputPath ?? 'dist/generators');
  const generatorsDir = options.generatorsDir ?? 'src/generators';

  if (!existsSync(tsConfig)) {
    console.error(`The generators tsconfig '${ tsConfig }' does not exist`);
    return { success: false };
  }

  rmSync(outputPath, { recursive: true, force: true });
  mkdirSync(outputPath, { recursive: true });

  try {
    execFileSync(
      process.execPath,
      [
        require.resolve('typescript/bin/tsc', { paths: [ context.root, __dirname ] }),
        '-p', tsConfig,
        '--outDir', outputPath,
        '--rootDir', root,
      ],
      { stdio: 'inherit', cwd: context.root },
    );
  } catch {
    return { success: false };
  }

  const generatorsJson = join(root, 'generators.json');
  if (existsSync(generatorsJson)) {
    cpSync(generatorsJson, join(outputPath, 'generators.json'));
  }

  const source = join(root, generatorsDir);
  if (existsSync(source)) {
    cpSync(source, join(outputPath, generatorsDir), {
      recursive: true,
      filter: (path) => {
        const name = basename(path);
        if (statSync(path).isDirectory()) {
          return name !== '__snapshots__';
        }
        return !/\.tsx?$/.test(name) && !/\.(spec|test)\./.test(name) && !name.endsWith('.snap');
      },
    });
  }

  mkdirSync(join(outputPath, generatorsDir), { recursive: true });
  writeFileSync(
    join(outputPath, generatorsDir, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2) + '\n',
  );

  return { success: true };
}
