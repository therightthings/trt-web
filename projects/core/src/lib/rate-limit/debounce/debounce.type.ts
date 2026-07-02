import { TimeConfig } from '../../utils';

export type DebounceOptions = {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number | TimeConfig;
};

export type DebouncedFunction<T extends (this: any, ...args: any[]) => any> = {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
};
