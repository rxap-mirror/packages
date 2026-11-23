import * as statusControllerHealthCheckService from './remote-methods/status-controller-health-check-service.remote-method';
import * as statusControllerHealthCheck from './remote-methods/status-controller-health-check.remote-method';

// The library specs are bundled for the browser (vitest), so the generated remote methods can not be
// discovered with `fs` at runtime. Every generated remote method module must be listed here.
const modules: Record<string, Record<string, unknown>> = {
  'status-controller-health-check-service.remote-method.ts': statusControllerHealthCheckService,
  'status-controller-health-check.remote-method.ts': statusControllerHealthCheck,
};

describe('generated remote methods', () => {
  const files = Object.keys(modules);

  it('has remote methods', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s exports an injectable remote method class', (file) => {
    const classes = Object.values(modules[file]).filter((v) => typeof v === 'function');
    expect(classes.length).toBeGreaterThan(0);
    for (const cls of classes as any[]) {
      expect(cls.prototype.call).toBeDefined();
    }
  });
});
