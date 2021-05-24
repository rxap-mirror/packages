const { Project } = require('@lerna/project');
const { readFileSync, writeFileSync } = require('fs');
const { relative } = require('path');

async function update() {
  const packages = await new Project(process.cwd()).getPackages();

  for (const pkg of packages) {
    const parsed = JSON.parse(
      readFileSync(pkg.manifestLocation).toString('utf-8')
    );
    if (!parsed.scripts) {
      parsed.scripts = {};
    }

    const match = pkg.name.match(/@rxap[-\/]([^@]+)/);
    const namePath = match[1].replace(/testing\//, '');
    const name = namePath.replace(/\//, '-');
    const rel = relative(pkg.location, pkg.rootPath);

    if (parsed.scripts) {
      delete parsed.scripts;
    }
    parsed.publishConfig = {
      directory: `${rel}/dist/${relative(pkg.rootPath, pkg.location)}`,
      access: 'public',
    };

    writeFileSync(pkg.manifestLocation, JSON.stringify(parsed, undefined, 2));
  }
}

update();
