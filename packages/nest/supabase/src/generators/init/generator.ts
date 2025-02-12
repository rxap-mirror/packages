import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  Tree,
} from '@nx/devkit';
import { join, relative } from 'path';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  if (!tree.exists(packageJsonFilePath)) {
    console.error('package.json not found in: ' + packageJsonFilePath);
    return;
  }
  const { peerDependencies, name: packageName } = JSON.parse(
    tree.read(packageJsonFilePath, 'utf-8')!
  );

  console.log(`Coerce peer dependencies for package: ${packageName}`);
  if (!peerDependencies || !Object.keys(peerDependencies).length) {
    console.log('No peer dependencies found');
    return;
  }
  console.log(`Peer dependencies: ${Object.keys(peerDependencies).join(', ')}`);

  const rootPackageJson = JSON.parse(tree.read('package.json', 'utf-8')!);

  let isDevDependency = !!rootPackageJson.devDependencies?.[packageName];

  if (
    isDevDependency &&
    [/^@rxap\/ngx/, /^@rxap\/nest/].some((rx) => rx.test(packageName))
  ) {
    rootPackageJson.dependencies ??= {};
    rootPackageJson.dependencies[packageName] =
      rootPackageJson.devDependencies[packageName];
    delete rootPackageJson.devDependencies[packageName];
    isDevDependency = false;
    tree.write('package.json', JSON.stringify(rootPackageJson, null, 2));
  }
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
    rootPackageJson.devDependencies ??= {};
    rootPackageJson.devDependencies[packageName] =
      rootPackageJson.dependencies[packageName];
    delete rootPackageJson.dependencies[packageName];
    isDevDependency = true;
    tree.write('package.json', JSON.stringify(rootPackageJson, null, 2));
  }

  const missingPeerDependencies = Object.entries(peerDependencies)
    .filter(
      ([dep]) =>
        !rootPackageJson.dependencies?.[dep] &&
        !rootPackageJson.devDependencies?.[dep]
    )
    .reduce((acc, [dep, version]) => ({ ...acc, [dep]: version }), {});

  if (!Object.keys(missingPeerDependencies).length) {
    console.log('No missing peer dependencies');
    return;
  }

  if (isDevDependency) {
    addDependenciesToPackageJson(tree, {}, missingPeerDependencies);
  } else {
    addDependenciesToPackageJson(tree, missingPeerDependencies, {});
  }

  await formatFiles(tree);

  installPackagesTask(tree);

  for (const peer of Object.keys(missingPeerDependencies)) {
    console.log(`Peer dependency ${peer} added to package.json`);
    const peerPackageJsonFilePath = join(
      'node_modules',
      ...peer.split('/'),
      'package.json'
    );
    if (!tree.exists(peerPackageJsonFilePath)) {
      console.log(`Peer dependency ${peer} has no package.json`);
      continue;
    }
    const { generators, schematics } = JSON.parse(
      tree.read(peerPackageJsonFilePath, 'utf-8')!
    );
    if (!generators && !schematics) {
      console.log(`Peer dependency ${peer} has no generators or schematics`);
      continue;
    }
    const configFile = generators || schematics;
    if (!tree.exists(join('node_modules', ...peer.split('/'), configFile))) {
      console.log(
        `Peer dependency ${peer} has no generators or schematics file`
      );
      continue;
    }
    const config = JSON.parse(
      tree.read(join('node_modules', ...peer.split('/'), configFile), 'utf-8')!
    );
    if (!config.generators?.init) {
      console.log(`Peer dependency ${peer} has no init generator`);
      continue;
    }
    const initGeneratorFilePath = config.generators.init.factory;
    const fullInitGeneratorFilePath =
      join('node_modules', ...peer.split('/'), initGeneratorFilePath) + '.js';
    if (!tree.exists(fullInitGeneratorFilePath)) {
      console.log(
        `Peer dependency ${peer} has no init generator file: ` +
          fullInitGeneratorFilePath
      );
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const initGenerator = require(join(
      'node_modules',
      ...peer.split('/'),
      initGeneratorFilePath
    ))?.default;
    if (typeof initGenerator !== 'function') {
      console.log(`Peer dependency ${peer} has no init generator function`);
      continue;
    }
    console.log(`Run init generator for peer dependency ${peer}`);
    await initGenerator(tree, options);
  }
}

export default initGenerator;
