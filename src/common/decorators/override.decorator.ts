import 'reflect-metadata';

/**
 * A decorator function that copies metadata from the overridden method
 * in the parent class to the overriding method in the child class.
 *
 * @returns A decorator function that can be applied to a method.
 *
 * @example
 * ```typescript
 * import { Override } from './override.decorator';
 *
 * class ParentClass {
 *   @SomeDecorator()
 *   someMethod() {
 *     // Parent method implementation
 *   }
 * }
 *
 * class ChildClass extends ParentClass {
 *   @Override()
 *   someMethod() {
 *     // Child method implementation
 *   }
 * }
 * ```
 *
 * @param target - The prototype of the class.
 * @param propertyKey - The name of the method being decorated.
 * @param descriptor - The property descriptor of the method.
 */
export function Override() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const parentTarget = Object.getPrototypeOf(target);
    const parentDescriptor = Object.getOwnPropertyDescriptor(parentTarget, propertyKey);

    if (parentDescriptor) {
      Reflect.getMetadataKeys(parentDescriptor.value).forEach((metadataKey) => {
        const metadataValue = Reflect.getMetadata(metadataKey, parentDescriptor.value);
        Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      });
    }
  };
}