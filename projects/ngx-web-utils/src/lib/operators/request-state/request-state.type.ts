export type RequestState<T = unknown> =
  | {
      state: 'loading';
      data?: T;
    }
  | {
      state: 'done';
      data: T;
    }
  | {
      state: 'error';
      error: unknown;
      data?: T;
    };
