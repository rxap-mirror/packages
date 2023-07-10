import {merge} from './util/merge';
import {isNumeric} from './isNumeric';

const default_date_options = {
  format: 'YYYY/MM/DD',
  delimiters: ['/', '-'],
  strictMode: false,
};

function isValidFormat(format: string) {
  return /(^(y{4}|y{2})[\/-](m{1,2})[\/-](d{1,2})$)|(^(m{1,2})[\/-](d{1,2})[\/-]((y{4}|y{2})$))|(^(d{1,2})[\/-](m{1,2})[\/-]((y{4}|y{2})$))/gi.test(format);
}

function zip<D, F>(date: D[], format: F[]): Array<[D, F]> {
  const zippedArr: Array<[D, F]> = [],
    len = Math.min(date.length, format.length);

  for (let i = 0; i < len; i++) {
    zippedArr.push([date[i], format[i]]);
  }

  return zippedArr;
}

export interface IsDateOptions {
  delimiters?: string[];
  format?: string;
  strictMode?: boolean;
}

export function isDate(input: unknown, options: string | IsDateOptions = {}) {
  if (typeof options === 'string') { // Allow backward compatbility for old format isDate(input [, format])
    options = merge({format: options}, default_date_options);
  } else {
    options = merge(options, default_date_options);
  }
  const _options: Required<IsDateOptions> = options as any;
  if (typeof input === 'string' && isValidFormat(_options.format)) {
    const formatDelimiter = _options.delimiters
      .find(delimiter => _options.format.indexOf(delimiter) !== -1);
    const dateDelimiter = _options.strictMode
      ? formatDelimiter
      : _options.delimiters.find(delimiter => input.indexOf(delimiter) !== -1);
    const dateAndFormat = zip(
      input.split(dateDelimiter!),
      _options.format.toLowerCase().split(formatDelimiter!) as string[],
    );
    const dateObj: Record<string, unknown> = {};

    for (const [dateWord, formatWord] of dateAndFormat) {
      if (dateWord.length !== formatWord.length) {
        return false;
      }

      dateObj[formatWord.charAt(0)] = dateWord;
    }

    return new Date(`${dateObj['m']}/${dateObj['d']}/${dateObj['y']}`).getDate() === Number(dateObj['d']);
  }

  if (!options.strictMode) {
    return Object.prototype.toString.call(input) === '[object Date]' && isNumeric(input) && isFinite(input);
  }

  return false;
}
