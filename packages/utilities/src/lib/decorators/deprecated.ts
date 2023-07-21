/**
 * The `Deprecated` function is a decorator factory that generates a decorator to mark a method or a class member as deprecated.
 * It logs a warning message to the console whenever the deprecated method or class member is accessed.
 *
 * @export
 * @param {string} message - The custom message to be displayed in the console warning when the deprecated method or class member is accessed.
 * @returns {Function} - A decorator function that takes three parameters: `target`, `propertyKey`, and `descriptor`.
 *
 * @param {object} target - The prototype of the class (for a static member) or the constructor of the class (for an instance member).
 * @param {string} propertyKey - The name of the property.
 * @param {PropertyDescriptor} [descriptor] - The Property Descriptor for the method or getter/setter property. If this parameter is not provided, the property is assumed to be a class member.
 *
 * The decorator function modifies the behavior of the method or class member in the following ways:
 * - If the `descriptor` parameter is provided, the function assumes that the property is a method or a getter/setter property.
 * - If the `value` property of the descriptor is a function, it is assumed to be a method. The function replaces the method with a new function that logs a warning message to the console before calling the original method.
 * - If the `descriptor` parameter is not provided, the function assumes that the property is a class member. It defines a getter and a setter for the property that log a warning message to the console whenever the property is accessed or modified.
 */
export function Deprecated(message: string) {
  return function (target: object, propertyKey: string, descriptor?: PropertyDescriptor): any {
    if (descriptor) {
      // method or getter/setter property
      if (descriptor.value && typeof descriptor.value === 'function') {
        // method
        return {
          ...descriptor,
          value: function (...args: any[]) {
            console.warn(`[${ this.constructor.name }.${ propertyKey }()] is deprecated!`, message);
            return (descriptor.value).apply(this, args);
          },
        };
      }
    } else {
      // class member
      Object.defineProperty(target, propertyKey, {
        get() {
          console.warn(`[${ this.constructor.name }.${ propertyKey }:get] is deprecated!`, message);
          return this[`__deprecated__${ propertyKey }`];
        },
        set(value): void {
          console.warn(`[${ this.constructor.name }.${ propertyKey }:set] is deprecated!`, message);
          this[`__deprecated__${ propertyKey }`] = value;
        },
      });
    }
  };
}
