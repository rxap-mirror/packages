import { SelectFormControl } from './select.form-control';
import { BaseFormGroup } from '../form-groups/base.form-group';
import { ToControlOptions } from '@rxap/utilities';

describe('Form System', () => {

  describe('Forms', () => {

    describe('SelectFormControl', () => {

      let control: SelectFormControl<any>;

      beforeEach(() => {
        control = new SelectFormControl('control', BaseFormGroup.EMPTY());
      });

      describe('Multi select mode', () => {

        beforeEach(() => {
          control.multiple = true;
          control.initial  = [];
        });

        it('init', () => {

          expect(control.value).toBeUndefined();
          control.init();
          expect(control.value).toEqual([]);
          expect(control.parent.value).toEqual({ control: [] });

        });

        it('should return all unselected options', () => {

          control.options = ToControlOptions([ 'c', 'd', 'f', 'l', 'a', 'c', 't', 'o' ]);
          control.value   = [ 'd', 'a' ];
          expect(control.unselectedOptions.map(option => option.value)).toEqual([ 'c', 'c', 'f', 'l', 'o', 't' ]);

        });

        it('should return all selected options', () => {

          control.options = ToControlOptions([ 'c', 'd', 'f', 'l', 'a', 'c', 't', 'o' ]);
          control.value   = [ 'd', 'a' ];
          expect(control.selectedOptions.map(option => option.value)).toEqual([ 'a', 'd' ]);

        });

      });

      it('should sort options when set', () => {

        control.options = ToControlOptions([ 'c', 'd', 'f', 'l', 'a', 'c', 't', 'o' ]);

        expect(control.options.map(option => option.value)).toEqual([ 'a', 'c', 'c', 'd', 'f', 'l', 'o', 't' ]);

      });

      it('should return all unselected options', () => {

        control.options = ToControlOptions([ 'c', 'd', 'f', 'l', 'a', 'c', 't', 'o' ]);
        control.value   = 'd';
        expect(control.unselectedOptions.map(option => option.value)).toEqual([ 'a', 'c', 'c', 'f', 'l', 'o', 't' ]);

      });

      it('should return all selected options', () => {

        control.options = ToControlOptions([ 'c', 'd', 'f', 'l', 'a', 'c', 't', 'o' ]);
        control.value   = 'd';
        expect(control.selectedOptions.map(option => option.value)).toEqual([ 'd' ]);

      });

    });

  });

});
