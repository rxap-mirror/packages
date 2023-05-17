module.exports = {
  addons: ['storybook-addon-angular-ivy', '@storybook/addon-knobs/register', '@storybook/addon-viewport/register', '@storybook/preset-scss'],
  framework: {
    name: '@storybook/angular',
    options: {}
  },
  docs: {
    autodocs: true
  }
};