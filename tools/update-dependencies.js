const Project = require('@lerna/project');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const rootPackageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json')).toString('utf-8'));

function getNewVersion(packageName, version) {
  if (!version) {
    const match = packageName.match(/@rxap[-\/]([^@]+)/);
    if (match) {
      const packageJsonPath = join(process.cwd(), 'libs', match[1], 'package.json');
      if (existsSync(packageJsonPath)) {
        const parsed = JSON.parse(readFileSync(packageJsonPath).toString('utf-8'));
        version = `>=${parsed.version}`;
      } else {
        version = null;
      }
    } else {
      version = null;
    }
  }

  if (version) {
    const match = version.match(/(\d\.\d\.\d.*)/);
    if (match) {
      version = `^${match[1]}`;
    } else {
      version = null;
    }
  }

  return version;
}

async function update(rootDependencies) {

  const packages = await new Project(process.cwd()).getPackages();

  for (const pkg of packages) {
    const parsed = JSON.parse(readFileSync(pkg.manifestLocation).toString('utf-8'));

    console.log('=========');
    console.log(`Project '${parsed.name}'`);

    for (const packageName of Object.keys(parsed.peerDependencies || {})) {
      const newVersion = await getNewVersion(packageName, rootDependencies[packageName]);
      if (newVersion) {
        console.log(`Update package '${packageName}' to version '${newVersion}'`);
      }
    }

    console.log('=========');

    writeFileSync(pkg.manifestLocation, JSON.stringify(parsed, undefined, 2));
  }
}

update(rootPackageJson.dependencies);
