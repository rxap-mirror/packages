// prettier >= 3.7 starts an ESM `import('./index.mjs')` while it is required, which crashes the CommonJS jest
// runtime ("A dynamic import callback was invoked without --experimental-vm-modules"). Unit tests never depend on the
// formatted output (the generator specs already mock prettier with an identity formatter), so map it to a stub.
module.exports = {
  format: async (text) => text,
  formatWithCursor: async (text) => ({ formatted: text, cursorOffset: 0 }),
  check: async () => true,
  resolveConfig: async () => null,
  resolveConfigFile: async () => null,
  clearConfigCache: async () => undefined,
  getFileInfo: async () => ({ ignored: false, inferredParser: null }),
  getSupportInfo: async () => ({ languages: [], options: [] }),
  version: '3.7.4',
  doc: {},
  util: {},
};
