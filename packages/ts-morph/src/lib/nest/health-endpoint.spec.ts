import { CreateProject } from '../create-project';
import { AddToGlobalHealthEndpoint } from './add-to-global-health-endpoint';
import { CoerceHealthEndpoint } from './coerce-health-endpoint';

describe('health endpoints', () => {
  const create = () => CreateProject().createSourceFile('health.controller.ts', `export class HealthController {}`);

  it('CoerceHealthEndpoint adds a route and injects the indicator', () => {
    const sf = create();
    CoerceHealthEndpoint(sf, 'my-db');
    const text = sf.getText();
    expect(text).toContain(`@Get('my-db')`);
    expect(text).toContain('@HealthCheck()');
    expect(text).toContain('myDb(): Promise<HealthCheckResult>');
    expect(text).toContain('() => this.myDbHealthIndicator.isHealthy()');
    expect(text).toContain(`from './my-db.health-indicator'`);
    expect(text).toContain(`from '@nestjs/terminus'`);
    expect(() => CoerceHealthEndpoint(CreateProject().createSourceFile('x.ts', ''), 'a')).toThrow();
  });

  it('AddToGlobalHealthEndpoint adds healthCheck method and indicators', () => {
    const sf = create();
    AddToGlobalHealthEndpoint(sf, 'db');
    const text = sf.getText();
    expect(text).toContain('healthCheck(): Promise<HealthCheckResult>');
    expect(text).toContain('@Get()');
    expect(text).toContain('this.dbHealthIndicator.isHealthy()');
    AddToGlobalHealthEndpoint(sf, 'cache');
    expect(sf.getText()).toContain('this.cacheHealthIndicator.isHealthy()');
  });
});
