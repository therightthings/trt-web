import { DebouncedFunction } from '../debounce/debounce.type';

export type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

export type ThrottledFunction<T extends (this: any, ...args: any[]) => any> = DebouncedFunction<T>;
