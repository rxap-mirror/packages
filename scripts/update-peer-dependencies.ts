import { createProjectGraph } from '@nrwl/workspace/src/core/project-graph';
import { ProjectGraph } from '@nrwl/workspace/src/core/project-graph/project-graph-models';
import {
  join,
  dirname
} from 'path';
import {
  readFileSync,
  existsSync,
  writeFileSync
} from 'fs';
// @ts-ignore
import * as conventionalRecommendedBump from 'conventional-recommended-bump';
// @ts-ignore
import { inc } from 'semver';
// @ts-ignore
import { Project } from '@lerna/project';
// @ts-ignore
import { PackageGraph } from '@lerna/package-graph';
// @ts-ignore
import { collectUpdates } from '@lerna/collect-updates';

const projectGraph: ProjectGraph = createProjectGraph();

const ExcludeNpmDependencies = ([ name, _ ]: [ string, any ]) => !name.match(/^npm:/);

const blackListNpmPeerDependencies: RegExp[] = [
  /npm:@angular-devkit\//,
  /npm:ramda/,
  /npm:uuid/,
  /npm:jest-preset-angular/,
  /npm:ts-morph/,
  /npm:@storybook/,
  /npm:across-tabs/,
  /npm:openapi-types/,
  /npm:ajv-oai/,
  /npm:@apidevtools\/json-schema-ref-parser/,
  /@rxap\/json-schema-to-typescript/,
  /npm:xmldom/,
  /npm:handlebars/,
  /npm:axios/
];

function FlattenDependencies(knownDependencies: string[]): string[] {

  const dependencies: string[] = knownDependencies.slice();

  for (const dep of knownDependencies) {
    dependencies.push(
      ...FlattenDependencies(projectGraph.dependencies[ dep ].map(dependency => dependency.target))
    );
  }

  return dependencies
    .filter((n, i, s) => s.indexOf(n) === i);

}

function ParsePackageJson(filePath: string): Record<string, any> {
  return JSON.parse(readFileSync(join(__dirname, '..', filePath)).toString('utf-8'));
}

function GetProjectPackageJsonPath(projectName: string): string {
  const packageJsonFile = join(projectGraph.nodes[ projectName ].data.root, 'package.json');

  if (!existsSync(packageJsonFile)) {
    throw new Error(`Could not find the package.json file for the project '${projectName}'`);
  }
  return packageJsonFile;
}

function GetProjectPackageJson(projectName: string): Record<string, any> {
  return ParsePackageJson(GetProjectPackageJsonPath(projectName));
}

function LoadRootPackageVersionMap() {
  const map = new Map<string, string>();

  const rootPackageJson = ParsePackageJson('package.json');

  for (const [ name, version ] of Object.entries(rootPackageJson.dependencies)) {
    map.set(name, (version as string).replace(/^[~^]/, ''));
  }

  for (const [ name, version ] of Object.entries(rootPackageJson.devDependencies)) {
    map.set(name, (version as string).replace(/^[~^]/, ''));
  }

  return map;
}

const rootPackageVersionMap = LoadRootPackageVersionMap();

const dependencyVersionMap = new Map<string, string>();

const projectNewVersion = new Map<string, string[]>();

async function GetNewProjectVersion(projectName: string): Promise<string> {
  const packageJson = GetProjectPackageJson(projectName);
  const version     = packageJson.version;

  if (await HasProjectVersionChange(projectName)) {


    return new Promise((resolve, reject) => {

      const options = {
        lernaPackage: packageJson.name,
        path:         dirname(join(__dirname, '..', GetProjectPackageJsonPath(projectName))),
        config:       require('conventional-changelog-angular')
      };

      conventionalRecommendedBump(options, (err: any, data: any) => {
        if (err) {
          return reject(err);
        }

        const releaseType = data.releaseType ?? 'patch';
        const newVersion  = inc(version, releaseType);

        if (newVersion !== version) {
          projectNewVersion.set(projectName, [ version, newVersion ]);
        }

        resolve(newVersion);

      });

    });

  }

  return version;

}

async function GetDependencyVersion(dependencyName: string): Promise<string> {

  if (!dependencyVersionMap.has(dependencyName)) {

    const match = dependencyName.match(/npm:(.*)/);
    if (match) {

      const packageName = match[ 1 ];

      if (!rootPackageVersionMap.has(packageName)) {
        throw new Error(`Could not find root package version for '${packageName}'`);
      }

      const version = '^' + rootPackageVersionMap.get(packageName)!;
      dependencyVersionMap.set(dependencyName, version);
    } else {
      const version = '^' + await GetNewProjectVersion(dependencyName);
      dependencyVersionMap.set(dependencyName, version);
    }

  }

  return dependencyVersionMap.get(dependencyName)!;

}

function GetPackageName(dependencyName: string): string {
  const match = dependencyName.match(/npm:(.*)/);
  if (match) {
    return match[ 1 ];
  }

  const packageJson = GetProjectPackageJson(dependencyName);

  return packageJson.name;
}

function WriteProjectPackageJson(projectName: string, packageJson: Record<string, any>): void {
  const packageJsonFile = join(projectGraph.nodes[ projectName ].data.root, 'package.json');

  if (!existsSync(packageJsonFile)) {
    throw new Error(`Could not find the package.json file for the project '${projectName}'`);
  }
  writeFileSync(packageJsonFile, JSON.stringify(packageJson, undefined, 2));
}

function AddDefaultPackageJsonProperties(packageJson: Record<string, any>): void {

  if (!packageJson.license) {
    packageJson.license = 'MIT';
  }

  if (!packageJson.keywords) {
    packageJson.keywords = packageJson.keywords ?? [];
    if (packageJson.name.match(/@rxap/)) {
      packageJson.keywords.push('rxap');
    }
    if (Object.keys(packageJson.peerDependencies).some(dep => dep.match(/@angular/))) {
      packageJson.keywords.push('angular');
    }
    if (packageJson.name.match(/@rxap\/schematics/)) {
      packageJson.keywords.push('schematics');
    }
    if (packageJson.name.match(/@rxap\/material/)) {
      packageJson.keywords.push('material');
    }
    if (packageJson.name.match(/@rxap\/plugin/)) {
      packageJson.keywords.push('plugin');
      packageJson.keywords.push('nrwl');
    }
    if (packageJson.name.match(/@rxap\/aws/)) {
      packageJson.keywords.push('aws');
    }
    if (packageJson.name.match(/@rxap\/gcp/)) {
      packageJson.keywords.push('gcp');
    }
    if (packageJson.name.match(/@rxap\/amplify/)) {
      packageJson.keywords.push('amplify');
    }
    if (packageJson.name.match(/@rxap\/firebase/)) {
      packageJson.keywords.push('firebase');
    }
  }

  packageJson.repository = 'git@gitlab.com:rxap/packages.git';
  packageJson.homepage   = 'https://gitlab.com/rxap/packages';
  packageJson.author     = 'Merzough Münker';
  packageJson.private    = false;
  packageJson.bugs       = {
    url:   'https://gitlab.com/rxap/packages/-/issues',
    email: 'incoming+rxap-packages-14898188-issue-@incoming.gitlab.com'
  };

}

const project = new Project(join(__dirname, '..'));

const packages$ = project.getPackages();

const packageGraph$ = packages$.then((packages: any) => new PackageGraph(packages));

const updates$ = packageGraph$.then((packageGraph: any) => {

  const updates = collectUpdates(
    packageGraph.rawPackageList,
    packageGraph,
    {
      cwd: join(__dirname, '..')
    },
    {
      conventionalCommits: true
    }
  ).filter((node: any) => {
    // --no-private completely removes private packages from consideration
    if (node.pkg.private) {
      // TODO: (major) make --no-private the default
      return false;
    }

    if (!node.version) {
      // a package may be unversioned only if it is private
      if (node.pkg.private) {
        console.info('version', 'Skipping unversioned private package %j', node.name);
      } else {
        throw new Error('failed');
      }
    }

    return !!node.version;
  });

  console.log(`Changed packages count: ${updates.length}`);

  return updates;

});

async function HasProjectVersionChange(projectName: string): Promise<boolean> {

  const updates = await updates$;

  const packageJson = GetProjectPackageJson(projectName);

  return !!updates.find((pkg: any) => pkg.name === packageJson.name);

}

async function Update({ dryRun }: { dryRun?: boolean } = {}) {

  for await (const [ name, dependencies ] of
    Object.entries(projectGraph.dependencies).filter(ExcludeNpmDependencies).map(([ _, dList ]) => [ _, dList.map(d => d.target) ] as [ string, string[] ])) {

    if (projectGraph.nodes[ name ].data.root.match(/apps\//)) {
      continue;
    }

    if (!(await HasProjectVersionChange(name))) {
      continue;
    }

    const flattenDependencies = FlattenDependencies(dependencies);

    const peerDependencies          = flattenDependencies.filter(dependency => !dependency.match(/^npm:/) ||
                                                                               !blackListNpmPeerDependencies.some(regex => dependency.match(regex)));
    const blackListPeerDependencies = flattenDependencies.filter(dependency => blackListNpmPeerDependencies.some(regex => dependency.match(regex)));

    const packageJson = GetProjectPackageJson(name);

    packageJson.peerDependencies
      = (await Promise.all(peerDependencies.map(async peerDependency => [ GetPackageName(peerDependency), await GetDependencyVersion(peerDependency) ])))
      .sort((aItem, bItem) => {

        const a = aItem[ 0 ];
        const b = bItem[ 0 ];

        if (a.match(/^@/)) {
          if (b.match(/^@/)) {
            return a.replace(/^@/, '').localeCompare(b.replace(/^@/, ''));
          } else {
            return -1;
          }
        } else if (b.match(/^@/)) {
          return 1;
        } else {
          return a.localeCompare(b);
        }

      })
      .map(item => ({ [ item[ 0 ] ]: item[ 1 ] }))
      .reduce((map, item) => ({ ...map, ...item }), {});

    console.log(`Update project ${name}:`);
    console.log('peerDependencies:', packageJson.peerDependencies);
    console.log('blackList', blackListPeerDependencies);

    AddDefaultPackageJsonProperties(packageJson);

    if (!dryRun) {
      WriteProjectPackageJson(name, packageJson);
    } else {
      console.log('Dry run!');
    }

  }

  for (const projectName of Array.from(projectNewVersion.keys())) {
    const versions = projectNewVersion.get(projectName)!;
    console.log(`${projectName}   ${versions[ 0 ]} -> ${versions[ 1 ]}`);
  }

}

const args = process.argv.slice(2);

const options = {
  dryRun: args.includes('--dry-run')
};

Update(options);
