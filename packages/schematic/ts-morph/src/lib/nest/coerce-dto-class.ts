import {
  camelize,
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceClass,
  CoerceDecorator,
  CoerceImports,
  CoercePropertyDeclaration,
  CoerceSourceFile,
  NormalizedTypeImport,
  TypeNames,
  WriteType,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  ObjectLiteralExpression,
  Project,
  PropertyDeclaration,
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  DtoClassProperty,
  NormalizeDataClassProperty,
} from './dto-class-property';
import 'colors';

export interface CoerceDtoClassOutput {
  className: string;
  filePath: string;
  sourceFile: SourceFile;
  classDeclaration: ClassDeclaration;
}

export interface CoerceDtoClassOptions {
  project: Project;
  name: string;
  propertyList?: DtoClassProperty[];
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceDtoClass(options: CoerceDtoClassOptions): CoerceDtoClassOutput {
  const {
    project,
    propertyList = [],
    tsMorphTransform = noop,
  } = options;
  let {
    name,
  } = options;

  name = dasherize(name);

  const className = CoerceSuffix(classify(name), 'Dto');
  const fileName = CoerceSuffix(name, '.dto');

  const sourceFile = CoerceSourceFile(project, join('dtos', fileName + '.ts'));
  const classDeclaration = CoerceClass(sourceFile, className);
  classDeclaration.setIsExported(true);

  for (const property of propertyList.map(NormalizeDataClassProperty)) {

    // create a clone of the property type to avoid modifying the original type
    // if the property type is a self reference we need to replace the self reference with the class name
    // if the property type is a deferred reference we need to replace the deferred reference with the class name
    const propertyType = { ...property.type };

    let subTypeOutput: CoerceDtoClassOutput;

    switch (propertyType.name) {

      case TypeNames.Self:
        propertyType.name = className;
        propertyType.isTypeOnly = false;
        propertyType.moduleSpecifier = null;
        propertyType.namedImport = null;
        propertyType.namespaceImport = null;
        propertyType.defaultImport = null;
        property.isType = true;
        break;

      case TypeNames.Deferred:
        subTypeOutput = CoerceDtoClass({
          project,
          name: [ name, dasherize(property.name) ].join('-'),
          propertyList: property.memberList,
        });
        propertyType.name = subTypeOutput.className;
        propertyType.moduleSpecifier = './' + dasherize(subTypeOutput.className.replace(/Dto$/, '')) + '.dto';
        propertyType.isTypeOnly = false;
        propertyType.namedImport = null;
        propertyType.namespaceImport = null;
        propertyType.defaultImport = null;
        property.isType = true;
        break;

    }


    let propertyName = camelize(property.name);
    const prefixMatch = property.name.match(/^(_+)/);

    if (prefixMatch) {
      propertyName = camelize(property.name.replace(/^_+/, ''));
      propertyName = prefixMatch[0] + propertyName;
    }

    const propertyDeclaration: PropertyDeclaration = CoercePropertyDeclaration(
      classDeclaration,
      propertyName,
    ).set({
      type: WriteType({
        isArray: property.isArray,
        type: propertyType,
      }, sourceFile),
      hasQuestionToken: property.isOptional,
      hasExclamationToken: !property.isOptional,
    });

    addExposeDecorator(propertyDeclaration);

    if (property.isArray) {
      addClassValidatorDecoratorForIsArray(propertyDeclaration);
    }
    if (property.isType) {
      addClassValidatorDecoratorForNestedDto(propertyDeclaration, propertyType, property.isArray);
    }
    if (property.isOptional) {
      addIsOptionalDecorator(propertyDeclaration);
    }

    addClassValidatorDecoratorForType(propertyDeclaration, propertyType);

    if (propertyType.name !== 'unknown') {
      cleanupUnknownApiPropertyDecorator(propertyDeclaration);
    }

  }

  tsMorphTransform(project, sourceFile, classDeclaration);

  return {
    className,
    filePath: '.' + join(sourceFile.getDirectoryPath(), sourceFile.getBaseNameWithoutExtension()),
    sourceFile,
    classDeclaration,
  };

}

function addIsOptionalDecorator(propertyDeclaration: PropertyDeclaration) {
  const sourceFile = propertyDeclaration.getSourceFile();
  CoerceDecorator(
    propertyDeclaration,
    'IsOptional',
    {
      arguments: [],
    },
  );
  CoerceImports(sourceFile, {
    namedImports: [ 'IsOptional' ],
    moduleSpecifier: 'class-validator',
  });
}

function addExposeDecorator(propertyDeclaration: PropertyDeclaration) {
  const sourceFile = propertyDeclaration.getSourceFile();
  CoerceDecorator(
    propertyDeclaration,
    'Expose',
    {
      arguments: [],
    },
  );
  CoerceImports(sourceFile, {
    namedImports: [ 'Expose' ],
    moduleSpecifier: 'class-transformer',
  });
}

function addClassValidatorDecoratorForIsArray(propertyDeclaration: PropertyDeclaration) {
  const sourceFile = propertyDeclaration.getSourceFile();
  CoerceDecorator(
    propertyDeclaration,
    'IsArray',
    {
      arguments: [],
    },
  );
  CoerceImports(sourceFile, {
    namedImports: [ 'IsArray' ],
    moduleSpecifier: 'class-validator',
  });
}

function addClassValidatorDecoratorForNestedDto(
  propertyDeclaration: PropertyDeclaration,
  propertyType: NormalizedTypeImport,
  isArray: boolean,
) {
  const sourceFile = propertyDeclaration.getSourceFile();
  CoerceDecorator(propertyDeclaration, 'Type', {
    arguments: [
      w => {
        w.write('() => ');
        WriteType({
          type: propertyType,
          isArray: false,
        }, sourceFile)(w);
      },
    ],
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'Type' ],
    moduleSpecifier: 'class-transformer',
  });
  CoerceDecorator(propertyDeclaration, 'IsInstance', {
    arguments: [
      WriteType({
        type: propertyType,
        isArray: false,
      }, sourceFile),
      w => {
        if (isArray) {
          Writers.object({ each: 'true' })(w);
        }
      },
    ],
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'IsInstance' ],
    moduleSpecifier: 'class-validator',
  });
}

function addClassValidatorDecoratorForType(
  propertyDeclaration: PropertyDeclaration,
  propertyType: NormalizedTypeImport,
) {

  const sourceFile = propertyDeclaration.getSourceFile();

  switch (propertyType.name) {
    case 'date':
      CoerceDecorator(
        propertyDeclaration,
        'IsDate',
        {
          arguments: [],
        },
      );
      CoerceImports(sourceFile, {
        namedImports: [ 'IsDate' ],
        moduleSpecifier: 'class-validator',
      });
      break;
    case 'number':
      CoerceDecorator(
        propertyDeclaration,
        'IsNumber',
        {
          arguments: [],
        },
      );
      CoerceImports(sourceFile, {
        namedImports: [ 'IsNumber' ],
        moduleSpecifier: 'class-validator',
      });
      break;
    case 'string':
      if (propertyDeclaration.getName()?.match(/^uuid|Uuid$/)) {
        CoerceImports(sourceFile, {
          namedImports: [ 'IsUUID' ],
          moduleSpecifier: 'class-validator',
        });
        CoerceDecorator(
          propertyDeclaration,
          'IsUUID',
          {
            arguments: [],
          },
        );
      } else {
        CoerceImports(sourceFile, {
          namedImports: [ 'IsString' ],
          moduleSpecifier: 'class-validator',
        });
        CoerceDecorator(
          propertyDeclaration,
          'IsString',
          {
            arguments: [],
          },
        );
      }
      break;
    case 'boolean':
      CoerceDecorator(
        propertyDeclaration,
        'IsBoolean',
        {
          arguments: [],
        },
      );
      CoerceImports(sourceFile, {
        namedImports: [ 'IsBoolean' ],
        moduleSpecifier: 'class-validator',
      });
      break;
    case 'unknown':
      CoerceDecorator(
        propertyDeclaration,
        'ApiProperty',
        {
          arguments: [ Writers.object({ type: w => w.quote('unknown') }) ],
        },
      );
      CoerceImports(sourceFile, {
        namedImports: [ 'ApiProperty' ],
        moduleSpecifier: '@nestjs/swagger',
      });
      break;
  }

}

function cleanupUnknownApiPropertyDecorator(propertyDeclaration: PropertyDeclaration) {
  const apiProperty = propertyDeclaration.getDecorators().find(d => d.getName() === 'ApiProperty');
  if (apiProperty) {
    const args = apiProperty.getArguments()[0];
    if (args instanceof ObjectLiteralExpression) {
      if (args.getProperty('type')?.getText().includes('unknown')) {
        apiProperty.remove();
      }
    }
  }
}
