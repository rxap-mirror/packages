const Project = require('@lerna/project');

module.exports = {
  extends: [
    '@commitlint/config-conventional'
  ],
  rules: {
    'scope-enum': async () => {

      const packages = await new Project(process.cwd()).getPackages();

      return [
        2,
        'always',
        packages.map(p => p.name.replace(/@rxap[-\/]/, '').replace(/\//g, '-'))
      ];

    }
  },
  ignores: [message => message.toLowerCase().startsWith('wip')]
};
