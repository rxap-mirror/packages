import { Project } from 'ts-morph';
import { CreateProject } from '../create-project';
import { CoerceNestAppConfig } from './coerce-nest-app-config';

describe('CoerceNestAppConfig', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should add new env validator', () => {

    const sourceCode = `import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};

validationSchema['PORT'] = Joi.number().default(3309);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/configuration');
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-configuration');
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));

export const VALIDATION_SCHEMA = Joi.object(validationSchema);`;

    const sourceFile = project.createSourceFile('app.config.ts', sourceCode);

    CoerceNestAppConfig(sourceFile, {
      itemList: [
        {
          name: 'PORT',
          type: 'number',
        },
        {
          name: 'STORAGE_DIR',
          type: 'string',
          defaultValue: 'join(__dirname, \'assets\')',
        },
      ],
    });

    expect(sourceFile.getFullText()).toEqual(`import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};

validationSchema['PORT'] = Joi.number().default(3309);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/configuration');
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-configuration');
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));
validationSchema['STORAGE_DIR'] = Joi.string().default(join(__dirname, 'assets'));

export const VALIDATION_SCHEMA = Joi.object(validationSchema);`);

  });

  it('should add replace env validator', () => {

    const sourceCode = `import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};

validationSchema['PORT'] = Joi.number().default(3309);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/configuration');
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-configuration');
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));

export const VALIDATION_SCHEMA = Joi.object(validationSchema);`;

    const sourceFile = project.createSourceFile('app.config.ts', sourceCode);

    CoerceNestAppConfig(sourceFile, {
      itemList: [
        {
          name: 'PORT',
          type: 'number',
        },
        {
          name: 'STORAGE_DIR',
          type: 'string',
          defaultValue: 'join(__dirname, \'assets\')',
        },
      ],
      overwrite: true,
    });

    expect(sourceFile.getFullText()).toEqual(`import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};

validationSchema['PORT'] = Joi.number();
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/configuration');
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-configuration');
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));
validationSchema['STORAGE_DIR'] = Joi.string().default(join(__dirname, 'assets'));

export const VALIDATION_SCHEMA = Joi.object(validationSchema);`);

  });

});
