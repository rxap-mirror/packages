import {EnvMapToString, StringToEnvMap} from './env-file';

describe('@rxap/schematics-utilities', () => {

  describe('env-file', () => {

    describe('StringToEnvMap', () => {

      it('should parse', () => {

        expect(StringToEnvMap(`string=string
number=42
boolean=true`)).toEqual({string: 'string', number: 42, boolean: true});

      });

      it('should parse string in quotes', () => {

        expect(StringToEnvMap(`key="value"`)).toEqual({key: 'value'});

      });

      it('should parse number in quotes as string', () => {

        expect(StringToEnvMap(`key="42"`)).toEqual({key: '42'});

      });

      it('should parse boolean in quotes as string', () => {

        expect(StringToEnvMap(`key="false"`)).toEqual({key: 'false'});
        expect(StringToEnvMap(`key="true"`)).toEqual({key: 'true'});

      });

      it('should parse string with spaces', () => {

        expect(StringToEnvMap(`key="value value"`)).toEqual({key: 'value value'});

      });

      it('should ignore comments', () => {

        expect(StringToEnvMap(`string=string
# comment
number=42
# comment
boolean=true`)).toEqual({string: 'string', number: 42, boolean: true});

      });

      it('should parse boolean', () => {

        expect(StringToEnvMap(`key=false`)).toEqual({key: false});
        expect(StringToEnvMap(`key=true`)).toEqual({key: true});

      });

    });

    describe('EnvMapToString', () => {

      it('should create map', () => {

        expect(EnvMapToString({})).toEqual('\n');
        expect(EnvMapToString({string: 'string', number: 42, boolean: true})).toEqual(`string=string
number=42
boolean=true
`);

      });

      it('should convert boolean', () => {

        expect(EnvMapToString({key: false})).toEqual(`key=false\n`);
        expect(EnvMapToString({key: true})).toEqual(`key=true\n`);

      });

      it('should convert string in quotes', () => {

        expect(EnvMapToString({key: 'value'})).toEqual(`key=value\n`);

      });

      it('should convert number in quotes as string', () => {

        expect(EnvMapToString({key: '42'})).toEqual(`key="42"\n`);

      });

      it('should convert boolean in quotes as string', () => {

        expect(EnvMapToString({key: 'false'})).toEqual(`key="false"\n`);
        expect(EnvMapToString({key: 'true'})).toEqual(`key="true"\n`);

      });

      it('should convert string with spaces', () => {

        expect(EnvMapToString({key: 'value value'})).toEqual(`key="value value"\n`);

      });

    });

  });

});
