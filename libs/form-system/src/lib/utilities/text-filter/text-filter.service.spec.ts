import { TextFilterService } from './text-filter.service';

describe('Form System', () => {

  describe('Utilities', () => {

    describe('Text Filter', () => {

      describe('TextFilterService', () => {

        const textFilter = new TextFilterService();

        describe('compare', () => {

          it('strings', () => {

            expect(textFilter.compare('value', 'Value')).toBeTruthy();

          });

        });

      });

    });

  });

});
