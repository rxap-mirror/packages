module.exports = {
  addons: [{
    name: '@storybook/addon-docs',
    options: {
      configureJSX: true
    }
  }],
  framework: {
    name: '@storybook/angular',
    options: {}
  },
  docs: {
    autodocs: true
  }
};
module.exports.core = {
  ...module.exports.core,
  builder: 'webpack5'
};