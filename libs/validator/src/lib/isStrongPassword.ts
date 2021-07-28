import { merge } from './util/merge';
import { assertString } from './util/assertString';

const upperCaseRegex = /^[A-Z]$/;
const lowerCaseRegex = /^[a-z]$/;
const numberRegex    = /^[0-9]$/;
const symbolRegex    = /^[-#!$@%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]$/;

const defaultOptions: Required<IsStrongPasswordOptions> = {
  minLength:                 8,
  minLowercase:              1,
  minUppercase:              1,
  minNumbers:                1,
  minSymbols:                1,
  returnScore:               false,
  pointsPerUnique:           1,
  pointsPerRepeat:           0.5,
  pointsForContainingLower:  10,
  pointsForContainingUpper:  10,
  pointsForContainingNumber: 10,
  pointsForContainingSymbol: 10
};

/* Counts number of occurrences of each char in a string
 * could be moved to util/ ?
 */
function countChars(str) {
  assertString(str);
  const result: Record<string, number> = {};
  Array.from(str).forEach((char) => {
    const curVal = result[ char ];
    if (curVal) {
      result[ char ] += 1;
    } else {
      result[ char ] = 1;
    }
  });
  return result;
}

/* Return information about a password */
function analyzePassword(password) {
  const charMap  = countChars(password);
  const analysis = {
    length:         password.length,
    uniqueChars:    Object.keys(charMap).length,
    uppercaseCount: 0,
    lowercaseCount: 0,
    numberCount:    0,
    symbolCount:    0
  };
  Object.keys(charMap).forEach((char) => {
    /* istanbul ignore else */
    if (upperCaseRegex.test(char)) {
      analysis.uppercaseCount += charMap[ char ];
    } else if (lowerCaseRegex.test(char)) {
      analysis.lowercaseCount += charMap[ char ];
    } else if (numberRegex.test(char)) {
      analysis.numberCount += charMap[ char ];
    } else if (symbolRegex.test(char)) {
      analysis.symbolCount += charMap[ char ];
    }
  });
  return analysis;
}

function scorePassword(analysis, scoringOptions) {
  let points = 0;
  points += analysis.uniqueChars * scoringOptions.pointsPerUnique;
  points += (analysis.length - analysis.uniqueChars) * scoringOptions.pointsPerRepeat;
  if (analysis.lowercaseCount > 0) {
    points += scoringOptions.pointsForContainingLower;
  }
  if (analysis.uppercaseCount > 0) {
    points += scoringOptions.pointsForContainingUpper;
  }
  if (analysis.numberCount > 0) {
    points += scoringOptions.pointsForContainingNumber;
  }
  if (analysis.symbolCount > 0) {
    points += scoringOptions.pointsForContainingSymbol;
  }
  return points;
}

export interface IsStrongPasswordOptions {
  minLength?: number;
  minLowercase?: number;
  minUppercase?: number;
  minNumbers?: number;
  minSymbols?: number;
  returnScore?: boolean;
  pointsPerUnique?: number,
  pointsPerRepeat?: number,
  pointsForContainingLower?: number,
  pointsForContainingUpper?: number,
  pointsForContainingNumber?: number,
  pointsForContainingSymbol?: number,
}

export function isStrongPassword(str, options: IsStrongPasswordOptions = {}) {
  assertString(str);
  const analysis                                    = analyzePassword(str);
  const _options: Required<IsStrongPasswordOptions> = merge(options, defaultOptions);
  if (_options.returnScore) {
    return scorePassword(analysis, options);
  }
  return analysis.length >= _options.minLength
         && analysis.lowercaseCount >= _options.minLowercase
         && analysis.uppercaseCount >= _options.minUppercase
         && analysis.numberCount >= _options.minNumbers
         && analysis.symbolCount >= _options.minSymbols;
}
