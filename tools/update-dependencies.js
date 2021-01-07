const Project = require('@lerna/project');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const rootPackageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json')).toString('utf-8'));

async function getNewVersion(packageName, version) {
  if (!version) {
    const match = packageName.match(/@rxap\/([^@]+)/);
    if (match) {
      const name = match[1].replace(/testing\//, '');
      const path = name
        .replace(/plugin-/, 'plugin/')
        .replace(/schematics-/, 'schematics/')
        .replace(/material-/, 'material/');
      const packageJsonPath = join(__dirname, '..', 'libs', path, 'package.json');
      if (existsSync(packageJsonPath)) {
        const parsed = JSON.parse(readFileSync(packageJsonPath).toString('utf-8'));
        version = `>=${parsed.version}`;
      } else {
        version = null;
      }
    } else {
      version = null;
    }
  } else {
    const match = version.match(/(\d+\.\d+\.\d+.*)/);
    if (match) {
      version = `^${match[1]}`;
    } else {
      version = null;
    }
  }

  return version;
}

async function updateForPackage(manifestLocation, rootDependencies) {
  const parsed = JSON.parse(readFileSync(manifestLocation).toString('utf-8'));

  console.log('=========');
  console.log(`Project '${parsed.name}'`);

  for (const packageName of Object.keys(parsed.peerDependencies || {})) {
    const newVersion = await getNewVersion(packageName, rootDependencies[packageName]);
    if (newVersion) {
      console.log(`Update package '${packageName}' to version '${newVersion}'`);
      parsed.peerDependencies[packageName] = newVersion;
    } else {
      console.log(`Could not find a version for '${packageName}'`);
    }
  }

  console.log('=========');

  writeFileSync(manifestLocation, JSON.stringify(parsed, undefined, 2));
}

async function update(rootDependencies) {

  const packages = await new Project(join(__dirname, '..')).getPackages();

  for (const pkg of packages) {
    await updateForPackage(pkg.manifestLocation, rootDependencies);
  }

}

const args = process.argv.slice(2);

if (args.length) {

  const manifestLocation = join(args[0], 'package.json');

  if (existsSync(manifestLocation)) {
    updateForPackage(manifestLocation, rootPackageJson.dependencies);
  } else {
    throw new Error(`Could not find package json in '${manifestLocation}'`);
  }

} else {

  update(rootPackageJson.dependencies);

}
