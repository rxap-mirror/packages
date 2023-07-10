import {camelize} from './camelize';
import {capitalize} from './capitalize';

/**
 Returns the UpperCamelCase form of a string.

 ```javascript
 'innerHTML'.classify();          // 'InnerHTML'
 'action_name'.classify();        // 'ActionName'
 'css-class-name'.classify();     // 'CssClassName'
 'my favorite items'.classify();  // 'MyFavoriteItems'
 ```

 @method classify
 @param str the string to classify
 @return the classified string
 */
export function classify(str: string): string {
  return str.split('.').map(part => capitalize(camelize(part))).join('.');
}
