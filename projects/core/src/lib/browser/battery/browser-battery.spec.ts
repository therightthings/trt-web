// Run: npx vitest run projects/core/src/lib/browser/battery/browser-battery.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserBattery } from './browser-battery';

const createBattery = () => {
  const listeners = new Map<string, EventListener>();
  const battery = {
    charging: true,
    level: 0.8,
    chargingTime: 0,
    dischargingTime: Infinity,
    addEventListener: vi.fn((event: string, handler: EventListener) => {
      listeners.set(event, handler);
    }),
    removeEventListener: vi.fn((event: string) => {
      listeners.delete(event);
    }),
    emit(event: string) {
      listeners.get(event)?.(new Event(event));
    },
  };

  return battery;
};

describe('BrowserBattery', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
  });

  it('returns false when getBattery is unavailable', () => {
    vi.stubGlobal('navigator', {});
    expect(BrowserBattery.isSupported()).toBe(false);
  });

  it('reads the current battery state', async () => {
    const battery = createBattery();
    vi.stubGlobal('navigator', { getBattery: vi.fn().mockResolvedValue(battery) });

    await expect(BrowserBattery.getState()).resolves.toEqual({
      charging: true,
      level: 0.8,
      percent: 80,
      chargingTime: 0,
      dischargingTime: Number.MAX_SAFE_INTEGER,
    });
  });

  it('notifies subscribers and removes all battery listeners', async () => {
    const battery = createBattery();
    vi.stubGlobal('navigator', { getBattery: vi.fn().mockResolvedValue(battery) });
    const handler = vi.fn();
    const subscription = await BrowserBattery.subscribe(handler);

    battery.level = 0.6;
    battery.charging = false;
    battery.emit('levelchange');

    expect(handler).toHaveBeenCalledWith({
      charging: false,
      level: 0.6,
      percent: 60,
      chargingTime: 0,
      dischargingTime: Number.MAX_SAFE_INTEGER,
    });

    subscription.unsubscribe();
    expect(battery.removeEventListener).toHaveBeenCalledTimes(4);
  });
});
