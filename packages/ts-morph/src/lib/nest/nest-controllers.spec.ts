import { CreateProject } from '../create-project';
import { CoerceHealthController } from './coerce-health-controller';
import { CoerceHealthModule } from './coerce-health-module';
import { CoerceNestAppController } from './coerce-nest-app-controller';
import { CoerceNestAppModule } from './coerce-nest-app-module';
import { CoerceNestController } from './coerce-nest-controller';
import { GetControllerClass } from './get-controller-class';
import { NormalizeDataClassProperty } from './dto-class-property';

const create = (text = '') => CreateProject().createSourceFile('x.ts', text);
/** creates a source file next to a nest module, which is required to coerce operations */
const createWithModule = (text = '') => {
  const project = CreateProject();
  project.createSourceFile('app.module.ts', "import { Module } from '@nestjs/common';\n@Module({})\nexport class AppModule {}");
  return project.createSourceFile('x.ts', text);
};

describe('CoerceNestController', () => {
  it('creates an exported controller with a dasherized path', () => {
    const file = create();
    const cls = CoerceNestController(file, { name: 'userGroup' });
    expect(cls.getName()).toBe('UserGroupController');
    expect(file.getFullText()).toContain("@Controller('user-group')");
    expect(file.getFullText()).toContain("import { Controller } from '@nestjs/common';");
  });

  it('uses an explicit path, keeps the Controller suffix and is idempotent', () => {
    const file = create();
    CoerceNestController(file, { name: 'ItemController', path: 'custom/path' });
    CoerceNestController(file, { name: 'ItemController', path: 'other' });
    expect(file.getClasses()).toHaveLength(1);
    expect(file.getClasses()[0].getName()).toBe('ItemController');
    expect(file.getFullText()).toContain("@Controller('custom/path')");
  });
});

describe('GetControllerClass', () => {
  it('finds controllers with and without a name', () => {
    const file = create('@Controller()\nclass AController {}\n@Controller()\nclass BController {}\nclass Other {}');
    expect(GetControllerClass(file, 'b').getName()).toBe('BController');
    expect(GetControllerClass(file).getName()).toBe('AController');
    const single = create('@Controller()\nclass AController {}\nclass Other {}');
    expect(GetControllerClass(single).getName()).toBe('AController');
    expect(() => GetControllerClass(single, 'missing')).toThrow();
  });
});

describe('CoerceNestAppController / CoerceNestAppModule', () => {
  it('replaces the generated default implementation', () => {
    const file = createWithModule(`import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  getData() { return this.appService.getData(); }
}`);
    CoerceNestAppController(file);
    const text = file.getFullText();
    expect(text).not.toContain('AppService');
    expect(text).not.toContain('getData');
    expect(text).toContain('@Public()');
    expect(text).toContain('@ApiExcludeController()');
    expect(text).toContain('return environment.app;');
    expect(text).toContain('return environment;');
    expect(text).toContain("from '../environments/environment'");
    expect(file.getClassOrThrow('AppController').getConstructors()).toHaveLength(0);
  });

  it('keeps remaining constructor parameters', () => {
    const file = createWithModule(`@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly other: Other) {}
}`);
    CoerceNestAppController(file);
    const [ctor] = file.getClassOrThrow('AppController').getConstructors();
    expect(ctor.getParameters().map((p) => p.getName())).toEqual(['other']);
  });

  it('creates the app module without the app service', () => {
    const file = create(`import { AppService } from './app.service';
@Module({ providers: [AppService] })
export class AppModule {}`);
    CoerceNestAppModule(file);
    expect(file.getFullText()).not.toContain('AppService');
    expect(file.getFullText()).toContain('providers: []');
    const fresh = create();
    CoerceNestAppModule(fresh);
    expect(fresh.getClass('AppModule')).toBeDefined();
  });
});

describe('health', () => {
  it('CoerceHealthModule creates a module importing TerminusModule', () => {
    const file = create();
    CoerceHealthModule(file);
    const text = file.getFullText();
    expect(text).toContain('HealthModule');
    expect(text).toContain('imports: [TerminusModule]');
    expect(text).toContain("import { TerminusModule } from '@nestjs/terminus';");
  });

  it('CoerceHealthController creates the controller with the health check', () => {
    const file = createWithModule();
    CoerceHealthController(file);
    const text = file.getFullText();
    expect(text).toContain("@Controller('app/health')");
    expect(text).toContain('@Public()');
    expect(text).toContain('@HealthCheck()');
    expect(text).toContain('@Inject(HealthCheckService)');
    expect(text).toContain('return this.health.check([]);');
    expect(text).toContain('healthCheck(): Promise<HealthCheckResult>');
  });
});

describe('NormalizeDataClassProperty', () => {
  it('marks deferred and self types as type properties', () => {
    expect(NormalizeDataClassProperty({ name: 'a', memberList: ['b'] }).isType).toBe(true);
    expect(NormalizeDataClassProperty({ name: 'a', type: '<self>' }).isType).toBe(true);
    expect(NormalizeDataClassProperty({ name: 'a', type: 'string' }).isType).toBe(false);
    expect(NormalizeDataClassProperty({ name: 'a', type: 'string', isType: true }).isType).toBe(true);
  });

  it('maps IconConfig to the IconDto of nest-dto', () => {
    const p = NormalizeDataClassProperty({ name: 'icon' });
    expect(p.type.name).toBe('IconDto');
    expect(p.type.moduleSpecifier).toBe('@rxap/nest-dto');
    expect(p.isType).toBe(true);
  });
});
