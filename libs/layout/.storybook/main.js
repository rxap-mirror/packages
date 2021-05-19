module.exports = {
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      },
    },
  ],
};

module.exports.core = { ...module.exports.core, builder: 'webpack5' };
