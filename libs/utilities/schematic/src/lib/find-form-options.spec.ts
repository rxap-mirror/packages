import { Tree } from '@angular-devkit/schematics';
import { findFromOptions } from './find-form-options';
import { normalize } from '@angular-devkit/core';

describe('@rxap/utilities', () => {

  describe('schematic', () => {

    describe('findFromOptions()', () => {

      const existsSpy  = jest.fn();
      const host: Tree = { exists: existsSpy } as any;

      afterEach(() => jest.resetAllMocks());


      it('should find file without any extension', () => {

        existsSpy.mockImplementation((path: string) => {
          return path === '/root/base/path/target.tree.ts';
        });

        expect(findFromOptions(
          host,
          normalize('root/base/path'),
          'target',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner'),
          'target',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner/child'),
          'target',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

      });

      it('should find file with partial extension', () => {

        existsSpy.mockImplementation((path: string) => {
          return path === '/root/base/path/target.tree.ts';
        });

        expect(findFromOptions(
          host,
          normalize('root/base/path'),
          'target.tree',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner'),
          'target.tree',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner/child'),
          'target.tree',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

      });

      it('should find file with full extension', () => {

        existsSpy.mockImplementation((path: string) => {
          return path === '/root/base/path/target.tree.ts';
        });

        expect(findFromOptions(
          host,
          normalize('root/base/path'),
          'target.tree.ts',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner'),
          'target.tree.ts',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner/child'),
          'target.tree.ts',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

      });

      it('should find file with absolute path', () => {

        existsSpy.mockImplementation((path: string) => {
          return path === '/root/base/path/target.tree.ts';
        });

        expect(findFromOptions(
          host,
          normalize('root/base/path'),
          'root/base/path/target.tree',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path'),
          'root/base/path/target',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path'),
          'root/base/path/target.tree.ts',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner'),
          'root/base/path/target.tree',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner'),
          'root/base/path/target',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

        expect(findFromOptions(
          host,
          normalize('root/base/path/inner/child'),
          'root/base/path/target.tree.ts',
          [ '.tree.ts', '.ts' ]
        )).not.toBeUndefined();

      });

    });

  });

});
