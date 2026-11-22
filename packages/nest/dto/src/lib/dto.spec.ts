import 'reflect-metadata';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CidDto } from './cid.dto';
import { ClassTransformOptionsFactory, classTransformOptions, TransformOptions, transformOptions } from './class-transformer-options';
import { ValidatorOptionsFactory, validatorOptions } from './class-validator-options';
import { ExistsDto } from './exists.dto';
import { FilterQueryDto } from './filter-query.dto';
import { IconDto } from './icon.dto';
import { IdDto } from './id.dto';
import { PageDto } from './page.dto';
import { ToDtoInstance, ToDtoInstanceList } from './to-dto-instance';
import { UuidObjectDto } from './uuid-object.dto';
import { UuidDto } from './uuid.dto';
import { BooleanValueDto, NumberValueDto, StringValueDto, ValueDto } from './value.dto';

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

class TestPage extends PageDto<string> {
  rows: string[] = [];
}

describe('options', () => {
  it('ClassTransformOptionsFactory merges additional options', () => {
    expect(ClassTransformOptionsFactory()).toEqual(classTransformOptions);
    expect(ClassTransformOptionsFactory({ excludeExtraneousValues: false })).toEqual({
      ...classTransformOptions,
      excludeExtraneousValues: false,
    });
    expect(transformOptions).toBe(classTransformOptions);
    expect(TransformOptions).toBe(ClassTransformOptionsFactory);
  });

  it('ValidatorOptionsFactory merges additional options', () => {
    expect(ValidatorOptionsFactory()).toEqual(validatorOptions);
    expect(ValidatorOptionsFactory({ whitelist: true })).toEqual({ ...validatorOptions, whitelist: true });
  });
});

describe('ToDtoInstance', () => {
  it('creates an instance and drops extraneous values', () => {
    const dto = ToDtoInstance(IdDto, { id: UUID, other: 'x' } as any);
    expect(dto).toBeInstanceOf(IdDto);
    expect(dto.id).toBe(UUID);
    expect((dto as any).other).toBeUndefined();
  });

  it('does not throw for invalid data', () => {
    const dto = ToDtoInstance(IdDto, { id: 'nope' });
    expect(dto.id).toBe('nope');
    expect(validateSync(dto).length).toBe(1);
  });

  it('respects custom transform options', () => {
    const dto = ToDtoInstance(IdDto, { id: UUID, other: 'x' } as any, { excludeExtraneousValues: false });
    expect((dto as any).other).toBe('x');
  });

  it('ToDtoInstanceList maps every item', () => {
    const list = ToDtoInstanceList(UuidDto, [{ uuid: UUID }, { uuid: 'bad' }]);
    expect(list).toHaveLength(2);
    expect(list.every((i) => i instanceof UuidDto)).toBe(true);
    expect(list[1].uuid).toBe('bad');
  });
});

describe('DTO validation', () => {
  const valid = (cls: any, plain: any) => validateSync(plainToInstance(cls, plain, classTransformOptions)).length === 0;

  it('IdDto / UuidDto require a uuid', () => {
    expect(valid(IdDto, { id: UUID })).toBe(true);
    expect(valid(IdDto, { id: '1' })).toBe(false);
    expect(valid(UuidDto, { uuid: UUID })).toBe(true);
    expect(valid(UuidDto, {})).toBe(false);
  });

  it('UuidObjectDto requires uuid and name', () => {
    expect(valid(UuidObjectDto, { uuid: UUID, name: 'a' })).toBe(true);
    expect(valid(UuidObjectDto, { uuid: UUID })).toBe(false);
  });

  it('CidDto: v0 optional', () => {
    expect(valid(CidDto, { cid: 'a', v1: 'b' })).toBe(true);
    expect(valid(CidDto, { cid: 'a', v1: 'b', v0: 'c' })).toBe(true);
    expect(valid(CidDto, { cid: 'a' })).toBe(false);
  });

  it('ExistsDto requires boolean', () => {
    expect(valid(ExistsDto, { exists: true })).toBe(true);
    expect(valid(ExistsDto, {})).toBe(false);
  });

  it('FilterQueryDto requires column and filter', () => {
    expect(valid(FilterQueryDto, { column: 'a', filter: 'b' })).toBe(true);
    expect(valid(FilterQueryDto, { column: 'a' })).toBe(false);
  });

  it('IconDto: all optional strings', () => {
    expect(valid(IconDto, {})).toBe(true);
    expect(valid(IconDto, { icon: 'home', color: 'red', fontColor: 'x', tooltip: 't', svgIcon: 's' })).toBe(true);
  });

  it('value DTOs validate their types', () => {
    expect(valid(NumberValueDto, { value: 1 })).toBe(true);
    expect(valid(NumberValueDto, { value: 'a' })).toBe(false);
    expect(valid(StringValueDto, { value: 'a' })).toBe(true);
    expect(valid(StringValueDto, { value: 1 })).toBe(true); // implicit conversion
    expect(valid(BooleanValueDto, { value: true })).toBe(true);
    expect(plainToInstance(ValueDto, { value: 'x' }, classTransformOptions)).toBeInstanceOf(ValueDto);
  });

  it('PageDto validates numbers and nested filter', () => {
    const page = ToDtoInstance(TestPage, {
      pageSize: 10,
      pageIndex: 0,
      total: 5,
      filter: [{ column: 'a', filter: 'b' }],
    } as any);
    expect(page.filter![0]).toBeInstanceOf(FilterQueryDto);
    expect(validateSync(page)).toHaveLength(0);
    const bad = plainToInstance(TestPage, { pageSize: -1, pageIndex: 0, total: 0, filter: [] }, classTransformOptions);
    expect(validateSync(bad).map((e) => e.property)).toContain('pageSize');
  });
});
