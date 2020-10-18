import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currency'
})
export class RxapCurrencyPipe implements PipeTransform {

  constructor(private readonly currency: CurrencyPipe) {}

  /**
   *
   * @param value The number to be formatted as currency.
   * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code,
   * such as `USD` for the US dollar and `EUR` for the euro. The default currency code can be
   * configured using the `DEFAULT_CURRENCY_CODE` injection token.
   * @param display The format for the currency indicator. One of the following:
   *   - `code`: Show the code (such as `USD`).
   *   - `symbol`(default): Show the symbol (such as `$`).
   *   - `symbol-narrow`: Use the narrow symbol for locales that have two symbols for their
   * currency.
   * For example, the Canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`. If the
   * locale has no narrow symbol, uses the standard symbol for the locale.
   *   - String: Use the given string value instead of a code or a symbol.
   * For example, an empty string will suppress the currency & symbol.
   *   - Boolean (marked deprecated in v5): `true` for symbol and false for `code`.
   *
   * @param digitsInfo Decimal representation options, specified by a string
   * in the following format:<br>
   * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
   *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
   * Default is `1`.
   *   - `minFractionDigits`: The minimum number of digits after the decimal point.
   * Default is `2`.
   *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
   * Default is `2`.
   * If not provided, the number will be formatted with the proper amount of digits,
   * depending on what the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) specifies.
   * For example, the Canadian dollar has 2 digits, whereas the Chilean peso has none.
   * @param locale A locale code for the locale format rules to use.
   * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
   * See [Setting your app locale](guide/i18n#setting-up-the-locale-of-your-app).
   */
  public transform(
    value: number,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean,
    digitsInfo?: string,
    locale?: string
  ): string | null {
    return this.currency.transform(value / 100, currencyCode, display, digitsInfo, locale);
  }

}

@NgModule({
  exports:      [ RxapCurrencyPipe ],
  declarations: [ RxapCurrencyPipe ],
  providers:    [ CurrencyPipe ]
})
export class CurrencyPipeModule {}
