import { RxapUtilitiesError } from '../error';

/**
 * The `required` function is a decorator function that enforces a property of a class to be required.
 * It throws an error if an attempt is made to get the value of the property before it is set.
 *
 * @param {any} target - The target object on which the property is defined or modified.
 * @param {string} propertyKey - The name of the property to be defined or modified.
 *
 * The function uses `Object.defineProperty()` to define a getter and a setter for the property.
 *
 * The getter throws an `RxapUtilitiesError` if it is invoked before the property is set.
 * The error message includes the name of the property and the name of the constructor of the target object.
 *
 * The setter uses `Object.defineProperty()` to redefine the property with the given value.
 * The redefined property is writable, configurable, and enumerable.
 *
 * The property defined by the `required` function is also configurable and enumerable.
 */
function required(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    get() {
      throw new RxapUtilitiesError(`Attribute ${ propertyKey } is required`, '', this.constructor.name);
    },
    set(value) {
      Object.defineProperty(
        this,
        propertyKey,
        {
          value,
          writable: true,
          configurable: true,
          enumerable: true,
        },
      );
    },
    configurable: true,
    enumerable: true,
  });
}

/**
 * The `Required` function is a TypeScript decorator that enforces the requirement of a specific attribute in a class.
 * It throws an error if an attempt is made to access the attribute before it has been set.
 *
 * @template T - The type of the `this` context within the `stackOrTarget` function.
 *
 * @param {((this: T) => string) | any} stackOrTarget - A function that returns a string when called with the `this` context, or any other value.
 * If a function is provided, it will be called with the `this` context when an error is thrown.
 * If any other value is provided, it will be used as the target object on which the property is defined.
 *
 * @param {string} [pk] - The name of the property to be defined on the target object. If not provided, the function returns another function that takes the target object and property name as parameters.
 *
 * @returns {any} - If `pk` is provided, the function does not return anything. If `pk` is not provided, the function returns another function that can be used to define a property on a target object.
 *
 * @throws {RxapUtilitiesError} - Throws an error with a message indicating that the attribute is required if an attempt is made to access the attribute before it has been set.
 *
 * @example
 * // If `pk` is provided
 * Required(targetObject, 'propertyName');
 *
 * // If `pk` is not provided
 * const defineProperty = Required(stackOrTarget);
 * defineProperty(targetObject, 'propertyName');
 *
 * @remarks
 * This function uses `Object.defineProperty` to define a property with a getter and setter on the target object.
 * The getter throws an error if the property is accessed before it has been set.
 * The setter allows the property to be set and makes it writable, configurable, and enumerable.
 *
 */
export function Required<T>(stackOrTarget: ((this: T) => string) | any, pk?: string): any {
  if (typeof pk === 'string') {
    Object.defineProperty(stackOrTarget, pk, {
      get() {
        throw new RxapUtilitiesError(`Attribute ${ pk } is required`, '', this.constructor.name);
      },
      set(value) {
        Object.defineProperty(
          this,
          pk,
          {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
          },
        );
      },
      configurable: true,
      enumerable: true,
    });
  } else {
    return function (target: any, propertyKey: string) {
      Object.defineProperty(target, propertyKey, {
        get() {
          throw new RxapUtilitiesError(
            `Attribute ${ propertyKey } is required`,
            '',
            this.constructor.name,
            stackOrTarget.call(this),
          );
        },
        set(value) {
          Object.defineProperty(
            this,
            propertyKey,
            {
              value,
              writable: true,
              configurable: true,
              enumerable: true,
            },
          );
        },
        configurable: true,
        enumerable: true,
      });
    };
  }
}

/**
 * Checks if a required property of a given object is defined.
 *
 * This function is used to verify if a specific property of an object, which is marked as required, is defined.
 * It uses the Object.getOwnPropertyDescriptor method to get the property descriptor of the specified property of the object.
 * The function then checks if the descriptor has a 'value' property, which indicates that the required property is defined.
 *
 * @template T - An object type.
 * @param {T} obj - The object to check.
 * @param {keyof T} propertyKey - The key of the property to check.
 * @returns {boolean} - Returns true if the required property is defined, false otherwise.
 *
 * @example
 * // Assuming we have an object like this:
 * // const obj = { name: 'John', age: undefined };
 * // The function can be used like this:
 * // IsRequiredPropertyDefined(obj, 'name'); // returns true
 * // IsRequiredPropertyDefined(obj, 'age'); // returns false
 *
 * @note This function is particularly useful when working with decorators like @Required in TypeScript.
 * It is used to check if a FormControl instance is already assigned to the component.
 * The check is done using property descriptor because the @Required decorator is used on the control property.
 */
export function IsRequiredPropertyDefined<T extends object>(obj: T, propertyKey: keyof T): boolean {
  // check if the component has already a FormControl instance assigned
  // It is required to test this with property descriptor, bs the
  // @Required decorator is used on the control property
  const descriptor = Object.getOwnPropertyDescriptor(obj, propertyKey);
  // eslint-disable-next-line no-prototype-builtins
  return !!descriptor && descriptor.hasOwnProperty('value');
}
