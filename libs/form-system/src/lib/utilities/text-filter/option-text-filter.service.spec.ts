import { OptionTextFilterService } from './option-text-filter.service';

describe('Form System', () => {

  describe('Utilities', () => {

    describe('Text Filter', () => {

      describe('OptionTextFilterService', () => {

        const textFilter = new OptionTextFilterService();

        describe('compare', () => {

          it('strings', () => {

            expect(textFilter.compare('value', { value: {}, display: 'value' })).toBeTruthy();
            expect(textFilter.compare('vald', { value: {}, display: 'value' })).toBeFalsy();
            expect(textFilter.compare('val', { value: {}, display: 'value' })).toBeTruthy();

          });

        });

      });

    });

  });

});
