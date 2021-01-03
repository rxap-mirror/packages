module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [message => message.toLowerCase().startsWith('wip')]
};
