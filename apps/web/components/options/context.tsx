'use client';

import {
  FC,
  ReactNode,
  createContext,
  memo,
  useCallback,
  useContext,
  useState,
} from 'react';

export type UiLayout =
  | 'mjcj'
  | 'cjmj'
  | 'jmjc'
  | 'jcjm'
  | 'jjmc'
  | 'mcjj'
  | 'jjcm'
  | 'cmjj'
  | 'ccmm'
  | 'mmcc'
  | 'cmcm'
  | 'mcmc';

export type AppOptions = {
  layout: UiLayout;
  set: <K extends SetteableOptions>(key: K, value: AppOptions[K]) => void;
};

type SetteableOptions = keyof Omit<AppOptions, 'set'>;

const DEFAULT_OPTIONS: Pick<AppOptions, SetteableOptions> = { layout: 'cjmj' };

const OptionsContext = createContext<AppOptions | undefined>(undefined);
OptionsContext.displayName = 'OptionsContext';

export const OptionsProvider: FC<{ children: ReactNode }> = memo(
  ({ children }) => {
    const [options, setOptions] =
      useState<Pick<AppOptions, SetteableOptions>>(DEFAULT_OPTIONS);
    const set: AppOptions['set'] = useCallback(
      (key, value) =>
        setOptions((opt) => ({
          ...opt,
          [key]: value,
        })),
      []
    );

    return (
      <OptionsContext.Provider value={{ ...options, set }}>
        {children}
      </OptionsContext.Provider>
    );
  }
);
OptionsProvider.displayName = 'OptionsProvider';

export function useOptions(): AppOptions {
  const ctx = useContext(OptionsContext);
  if (!ctx) {
    throw new Error(`OptionsContext not found`);
  }
  return ctx;
}
