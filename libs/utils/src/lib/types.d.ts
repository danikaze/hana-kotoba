/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Returns the union of the interfaces A and B (same as `A & B`)
 * but guaranteeing there are no field collisions between them
 */
export type ForbidFieldCollision<
  A,
  B extends Record<string, any> & Partial<Record<keyof A, never>>
> = A & B;

/**
 * Checks that a `SubType` is properly extending a given `Type`
 */
export type SubType<Type, SubType extends Type> = SubType extends Type
  ? SubType
  : never;

/**
 * Converts some `Keys` of a given `Interface` to optional
 */
export type PartialPick<
  Interface extends {},
  Keys extends keyof Interface
> = Omit<Interface, Keys> & Partial<Pick<Interface, Keys>>;

/**
 * Converts some `Keys` of a given `Interface` to required
 */
export type RequiredPick<
  Interface extends {},
  Keys extends keyof Interface
> = Omit<Interface, Keys> & Required<Pick<Interface, Keys>>;

/**
 * Returns the type used for a Map
 * GetMapKey<Map<K, V>> ==> K
 */
export type GetMapKey<M> = M extends Map<infer K, infer V> ? K : never;

/**
 * Returns the value used for a Map
 * GetMapValue<Map<K, V>> ==> V
 */
export type GetMapValue<M> = M extends Map<infer K, infer V> ? V : never;

/**
 * Exclude from an array of type T elements that matches U
 *
 * @example
 * ExcludeFromArray<(number | string)[], string> === number[]
 */
export type ExcludeFromArray<T extends any[], U> = T extends (infer D)[]
  ? Exclude<D, U>[]
  : never;

/**
 * Return the keys of an object `O` which values matches the type `T`
 */
export type KeysOfWithValue<O extends {}, T> = Exclude<
  {
    [K in keyof O]: O[K] extends T ? K : never;
  }[keyof O],
  undefined
>;

/**
 * Return the keys of an object `O` which values NOT matches the type `T`
 */
export type KeysOfWithNoValue<O extends {}, T> = Exclude<
  {
    [K in keyof O]: O[K] extends T ? never : K;
  }[keyof O],
  undefined
>;

/**
 * A type `T` or a `Promise` for that type
 */
export type OptionalPromise<T> = T | Promise<T>;
