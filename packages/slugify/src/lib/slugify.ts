/**
 * Interface for configuring the slugify operation.
 *
 * @property suffixLength - The length of the random suffix to append when suffix option is true. Defaults to 12 characters.
 * @property replacement - The character to replace spaces and other invalid characters with. Defaults to '-'.
 * @property remove - A regular expression pattern defining which characters to remove. Defaults to /[^\w\s$*_+~.()'"!\-:@]+/g.
 * @property lower - If true, converts the slug to lowercase. Defaults to false.
 * @property strict - If true, removes all characters except letters, numbers, and the replacement character. Defaults to false.
 * @property locale - The locale to use for character mapping. Supported values are 'de' and 'vi'.
 * @property suffix - If true, appends a random string to the slug. Defaults to false.
 *
 * @example
 * ```typescript
 * const options: SlugifyOptions = {
 *   lower: true,
 *   strict: true,
 *   suffix: true,
 *   suffixLength: 8
 * };
 * ```
 */
export interface SlugifyOptions {
  /**
   * @property suffixLength - The length of the random suffix to append to the slug. If not specified, defaults to 12 characters. Only used when the suffix option is set to true.
   *
   * @example
   * ```typescript
   * // creates a slug with a 6-character random suffix
   * slugify('my string', { suffix: true, suffixLength: 6 }); // 'my-string-Ab3DeF'
   * ```
   */
  suffixLength?: number;

  /**
   * @property replacement - The character to replace spaces and other special characters with. If not specified, defaults to '-'.
   *
   * @example
   * ```typescript
   * // Using a custom replacement character
   * slugify('hello world', { replacement: '_' }); // returns 'hello_world'
   * ```
   */
  replacement?: string;

  /**
   * @property remove - A regular expression pattern used to specify characters that should be removed from the string during slugification. If not provided, defaults to `/[^\w\s$*_+~.()'"!\-:@]+/g` which removes all characters except word characters, whitespace, and specific special characters.
   *
   * @example
   * ```typescript
   * // removes all vowels
   * const options: SlugifyOptions = {
   *   remove: /[aeiou]/g
   * };
   * ```
   */
  remove?: RegExp;

  /**
   * @summary
   * Determines whether the resulting slug should be converted to lowercase.
   *
   * @default
   * `false`
   *
   * @example
   * ```typescript
   * // With lower: true
   * slugify('Hello World', { lower: true }); // 'hello-world'
   *
   * // With lower: false (default)
   * slugify('Hello World'); // 'Hello-World'
   * ```
   */
  lower?: boolean;

  /**
   * @summary
   * Determines whether to enforce strict mode for slug generation, removing all characters except letters, numbers, and the replacement character.
   *
   * @default
   * false
   *
   * @example
   * ```typescript
   * // With strict: true
   * slugify('Hello, World!', { strict: true }) // returns 'HelloWorld'
   *
   * // With strict: false (default)
   * slugify('Hello, World!', { strict: false }) // returns 'Hello-World'
   * ```
   */
  strict?: boolean;

  /**
   * @param locale - The locale to use for character mapping. Supported values are 'de' for German and 'vi' for Vietnamese. Each locale provides specific character mappings, for example German maps 'ä' to 'ae' and Vietnamese maps 'đ' to 'd'.
   *
   * @example
   * ```typescript
   * // German locale example
   * slugify('größer', { locale: 'de' }) // outputs 'groesser'
   *
   * // Vietnamese locale example
   * slugify('Đồng', { locale: 'vi' }) // outputs 'Dong'
   * ```
   */
  locale?: string;

  /**
   * @summary
   * Indicates whether to append a random suffix to the generated slug.
   *
   * @default
   * false
   *
   * @example
   * ```typescript
   * // generates: "my-slug-Ax7Bk9pL2M3n"
   * slugify("my slug", { suffix: true });
   * ```
   */
  suffix?: boolean;

}

/**
 * A class that provides string slugification functionality with support for character mapping, localization, and customization options.
 *
 * @example
 * ```typescript
 * const slugifier = new Slugify();
 * slugifier.replace('Hello World!'); // returns 'Hello-World'
 * slugifier.replace('Hello/World!', { lower: true }); // returns 'hello-world'
 * ```
 *
 * @example
 * ```typescript
 * // With custom character mapping
 * const slugifier = new Slugify();
 * slugifier.extend({ '☺': 'smile' });
 * slugifier.replace('Hello ☺'); // returns 'Hello-smile'
 * ```
 *
 * @property charMap A record containing character mappings for special characters, symbols, and diacritics to their ASCII equivalents
 * @property locales A record containing locale-specific character mappings for different languages
 *
 * @throws Will throw a TypeError if invalid options are provided to the replace method
 *
 * @returns A new instance of the Slugify class with default character mappings and locale support for German and Vietnamese
 */
export class Slugify {

  /**
   * A map of special characters to their ASCII representation. This map contains a comprehensive set of character mappings including currency symbols, diacritical marks, mathematical symbols, and various language-specific characters from different writing systems (Latin, Cyrillic, Georgian, etc.).
   *
   * @example
   * ```typescript
   * // Example of some mappings
   * {
   *   "£": "pound",
   *   "€": "euro",
   *   "Ä": "A",
   *   "ß": "ss",
   *   "Ж": "Zh"
   * }
   * ```
   *
   * @default A large JSON object containing character mappings for transliteration
   */
  public readonly charMap: Record<string, string> = JSON.parse(
    '{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","‘":"\'","’":"\'","“":"\\"","”":"\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial"}');
  /**
   * @property A mapping of locale-specific character replacements. Each locale key contains a record of special characters and their replacements. Currently supports 'de' (German) and 'vi' (Vietnamese) locales.
   *
   * @example
   * ```typescript
   * // German locale replacements
   * {
   *   "de": {
   *     "Ä": "AE",
   *     "ä": "ae",
   *     "Ö": "OE",
   *     "ö": "oe",
   *     "Ü": "UE",
   *     "ü": "ue"
   *   },
   *   "vi": {
   *     "Đ": "D",
   *     "đ": "d"
   *   }
   * }
   * ```
   */
  public readonly locales: Record<string, Record<string, string>> = JSON.parse(
    '{"de":{"Ä":"AE","ä":"ae","Ö":"OE","ö":"oe","Ü":"UE","ü":"ue"},"vi":{"Đ":"D","đ":"d"}}');

  /**
   * @summary
   * Extends the character mapping with custom character replacements.
   *
   * @param customMap - A record object where each key is a character to be replaced and the value is the replacement string.
   *
   * @example
   * ```typescript
   * const slugifier = new Slugify();
   * slugifier.extend({ '€': 'euro', '£': 'gbp' });
   * ```
   */
  public extend(customMap: Record<string, string>): void {
    Object.assign(this.charMap, customMap);
  }

  /**
   * @summary
   * Converts a string into a URL-friendly slug by replacing special characters, spaces, and optionally adding a random suffix.
   *
   * @param string - The input string to be converted into a slug
   * @param options - Configuration options for the slug generation
   * @param options.locale - The locale to use for character replacements. Supported locales include 'de' and 'vi'
   * @param options.replacement - The character to use as replacement for spaces and other special characters. Defaults to '-'
   * @param options.remove - A regular expression pattern specifying which characters to remove
   * @param options.lower - If true, converts the slug to lowercase
   * @param options.strict - If true, removes all characters except letters, numbers, and the replacement character
   * @param options.suffix - If true, appends a random string to the slug
   * @param options.suffixLength - The length of the random suffix if suffix option is true. Defaults to 12
   *
   * @returns A URL-friendly slug string
   *
   * @example
   * ```typescript
   * const slugify = new Slugify();
   * // Basic usage
   * slugify.replace('Hello World!') // returns 'Hello-World'
   *
   * // With options
   * slugify.replace('Hello World!', { lower: true, strict: true }) // returns 'hello-world'
   *
   * // With suffix
   * slugify.replace('Hello World', { suffix: true }) // returns 'Hello-World-Ax7Yt9Zk2Pq3'
   *
   * // With locale
   * slugify.replace('Über', { locale: 'de' }) // returns 'Ueber'
   * ```
   */
  public replace(string: string, options: SlugifyOptions = {}): string {

    const locale: Record<string, string> = options.locale ? this.locales[options.locale] ?? {} : {};

    const replacement = options.replacement ?? '-';

    let slug = string
      .split('')
      // replace characters based on charMap
      .reduce((result, ch) => result + (locale[ch] || this.charMap[ch] || ch)
        // remove not allowed characters
        .replace(options.remove || /[^\w\s$*_+~.()'"!\-:@]+/g, ''), '')
      // trim leading/trailing spaces
      .trim()
      // convert spaces to replacement character
      // also remove duplicates of the replacement character
      .replace(new RegExp('[\\s' + replacement + ']+', 'g'), replacement);

    if (options.lower) {
      slug = slug.toLowerCase();
    }

    if (options.strict) {
      // remove anything besides letters, numbers, and the replacement char
      slug = slug
        .replace(new RegExp('[^a-zA-Z0-9' + replacement + ']', 'g'), '')
        // remove duplicates of the replacement character
        .replace(new RegExp('[\\s' + replacement + ']+', 'g'), replacement);
    }

    if (options.suffix) {
      const suffix = this.generateRandomString(options.suffixLength);
      slug = [ slug, suffix ].join('-');
    }

    return slug;

  }

  private generateRandomString(length = 12) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}

/**
 * @summary
 * Creates a URL-friendly slug from a given string with optional customization options.
 *
 * @param string - The input string to be converted into a slug
 * @param options - Configuration options for the slug generation
 * @param customMap - Optional custom character mapping to extend the default character replacements
 *
 * @returns A URL-friendly string (slug) with special characters replaced and optional modifications based on the provided options
 *
 * @example
 * ```typescript
 * // Basic usage
 * slugify('Hello World!') // returns 'Hello-World'
 *
 * // With options
 * slugify('Hello World!', { lower: true }) // returns 'hello-world'
 *
 * // With suffix
 * slugify('Hello World', { suffix: true }) // returns 'Hello-World-Ax7Yt9pL2Mn4'
 *
 * // With custom locale
 * slugify('München', { locale: 'de' }) // returns 'Muenchen'
 * ```
 *
 * @throws
 * If an invalid locale is provided in options, the function will fallback to default character mappings
 */
export function slugify(string: string, options: SlugifyOptions = {}, customMap?: Record<string, string>) {
  const instance = new Slugify();
  if (customMap) {
    instance.extend(customMap);
  }
  return instance.replace(string, options);
}
