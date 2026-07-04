import { TimeConfig, toMs } from '../utils';

export function wait(time: number | TimeConfig) {
  const ms = toMs(time);

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
