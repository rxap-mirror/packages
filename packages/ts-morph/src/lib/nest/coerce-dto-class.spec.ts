import { CreateProject } from '../create-project';
import { CoerceDtoClass } from './coerce-dto-class';

describe('CoerceDtoClass', () => {
  it('creates dto with validators for primitive types', () => {
    const project = CreateProject();
    const out = CoerceDtoClass({
      project,
      name: 'my-user',
      propertyList: [
        'name:string', 'age:number', 'active:boolean', 'created:date', 'uuid:string', 'x:unknown',
        { name: 'tags', type: 'string', isArray: true },
        { name: 'nick', type: 'string', isOptional: true },
        '_private:string',
      ] as any,
    });
    expect(out.className).toBe('MyUserDto');
    expect(out.sourceFile.getFilePath()).toContain('dtos/my-user.dto.ts');
    expect(out.classDeclaration.isExported()).toBe(true);
    const text = out.sourceFile.getText();
    expect(text).toContain('@Expose()');
    expect(text).toContain('@IsString()');
    expect(text).toContain('@IsNumber()');
    expect(text).toContain('@IsBoolean()');
    expect(text).toContain('@IsDate()');
    expect(text).toContain('@IsUUID()');
    expect(text).toContain('@IsArray()');
    expect(text).toContain('@IsOptional()');
    expect(text).toContain('_private');
    expect(text).toMatch(/import \{[^}]*Expose[^}]*\} from 'class-transformer'/);
    expect(text).toMatch(/import \{[^}]*IsString[^}]*\} from 'class-validator'/);
  });

  it('handles self reference and deferred members', () => {
    const project = CreateProject();
    const out = CoerceDtoClass({
      project,
      name: 'node',
      propertyList: [
        { name: 'parent', type: '<self>' as any, isOptional: true },
        { name: 'children', type: '<self>' as any, isArray: true },
        { name: 'meta', memberList: [ 'key:string' ] },
      ] as any,
    });
    const text = out.sourceFile.getText();
    expect(text).toContain('@Type(() => NodeDto)');
    expect(text).toMatch(/@IsInstance\(NodeDto, \{\s*each: true\s*\}\)/);
    expect(text).toContain('@IsInstance(NodeDto)');
    expect(text).toContain('NodeMetaDto');
    expect(text).toContain(`from './node-meta.dto'`);
    expect(project.getSourceFile('dtos/node-meta.dto.ts')).toBeDefined();
  });

  it('calls tsMorphTransform and maps IconConfig', () => {
    const project = CreateProject();
    const transform = jest.fn();
    const out = CoerceDtoClass({ project, name: 'ico', propertyList: [ { name: 'icon', type: 'IconConfig' } ], tsMorphTransform: transform });
    expect(transform).toHaveBeenCalledWith(project, out.sourceFile, out.classDeclaration);
    expect(out.sourceFile.getText()).toContain('IconDto');
    expect(out.sourceFile.getText()).toContain('@rxap/nest-dto');
  });
});
