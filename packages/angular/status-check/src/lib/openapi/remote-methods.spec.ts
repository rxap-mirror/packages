import { readdirSync } from 'fs';
import { join } from 'path';

describe('generated remote methods', () => {
  const dir = join(__dirname, 'remote-methods');
  const files = readdirSync(dir).filter((f) => f.endsWith('.remote-method.ts'));

  it('has remote methods', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s exports an injectable remote method class', (file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(join(dir, file));
    const classes = Object.values(module).filter((v) => typeof v === 'function');
    expect(classes.length).toBeGreaterThan(0);
    for (const cls of classes as any[]) {
      expect(cls.prototype.call).toBeDefined();
    }
  });
});
