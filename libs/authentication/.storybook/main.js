const rootMain = require('../../../.storybook/main');
rootMain.addons.push('@storybook/addon-essentials');
rootMain.core = { ...rootMain.core, builder: 'webpack5' };

// Use the following syntax to add addons!
// rootMain.addons.push('');
rootMain.stories.push(
  ...[
    '../src/lib/**/*.stories.mdx',
    '../components/src/lib/**/*.stories.mdx',
    '../src/lib/**/*.stories.@(js|jsx|ts|tsx)',
    '../components/src/lib/**/*.stories.@(js|jsx|ts|tsx)',
  ]
);

module.exports = rootMain;
