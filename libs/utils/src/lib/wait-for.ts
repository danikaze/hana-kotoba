import { OptionalPromise } from './types';

export interface WaitForOptions<N = DefaultNgValue> {
  /**
   * Ms to wait before the next check
   */
  pollInterval?: number;
  /**
   * Ms to wait before rejecting the returned Promise
   * Set to `0` or `Infinity` to wait forever
   */
  timeout?: number;
  /**
   * String to identify the error in case of timeout
   */
  name?: string;
  /**
   * If the condition returns one of this values is to keep waiting
   * By default: `undefined` | `null` | `false` | `0`, `''`
   */
  ngValues?: N[];
  /**
   * If `true` it will try to bypass fake timers on polling and timeout
   */
  useRealTimer?: boolean;
}

/**
 * Wait for a condition to return a non-`ngValue`
 */
export function waitFor<T, N>(
  condition: () => OptionalPromise<T | N>,
  options?: WaitForOptions<N>
): Promise<Exclude<T, N>> {
  const { pollInterval, timeout, name, ngValues, useRealTimer } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const DateClass = useRealTimer ? RealDate : Date;
  const schedule = useRealTimer ? realSetTimeout : setTimeout;

  return new Promise<Exclude<T, N>>((resolve, reject) => {
    const start = DateClass.now();
    const check = async () => {
      const value = await condition();
      if (!(ngValues as N[]).includes(value as N)) {
        resolve(value as Exclude<T, N>);
        return;
      }
      if (timeout > 0 && DateClass.now() - start > timeout) {
        reject(`${name}.timeout`);
      } else {
        schedule(check, pollInterval);
      }
    };

    check();
  });
}

type DefaultNgValue = undefined | null | false | 0;

const DEFAULT_OPTIONS: Required<WaitForOptions<DefaultNgValue>> = {
  pollInterval: 50,
  timeout: 15_000,
  name: 'waitFor',
  ngValues: [undefined, null, false, 0],
  useRealTimer: false,
};

const RealDate = Date;
const realSetTimeout = setTimeout;
