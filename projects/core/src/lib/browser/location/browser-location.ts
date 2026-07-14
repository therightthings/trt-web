import { requireBrowserEnv } from '../../utils';
import { BrowserPermission } from '../permission/browser-permission';
import { ExecuteBrowserServiceResult } from '../permission/browser-permission.type';
import { BrowserLocationOptions, GeoSpeed } from './browser-location.type';

export class BrowserLocation {
  private static geoSpeedMap: {
    [key in GeoSpeed]: PositionOptions;
  } = {
    accurate: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    },
    fast: {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 20000,
    },
  };

  static async getLocation(
    options?: BrowserLocationOptions,
  ): Promise<ExecuteBrowserServiceResult<GeolocationPosition>> {
    requireBrowserEnv();

    let permission = await BrowserPermission.getState('geolocation');

    if (permission === 'unsupported') {
      return { permission, success: false };
    }

    if (permission != 'granted') {
      permission = await BrowserPermission.request('geolocation');

      if (permission != 'granted') {
        return { permission, success: false };
      }
    }

    const data = await this.getGeolocationPosition(options);

    if (!data) {
      return { permission, success: false };
    }

    return {
      permission,
      data,
      success: true,
    };
  }

  private static async getGeolocationPosition(
    options?: BrowserLocationOptions,
  ): Promise<GeolocationPosition | null> {
    const speedOptions = this.geoSpeedMap[options?.speed ?? 'accurate'];
    const {
      enableHighAccuracy = speedOptions.enableHighAccuracy,
      timeout = speedOptions.timeout,
      maximumAge = speedOptions.maximumAge,
    } = options ?? {};

    try {
      return await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: enableHighAccuracy,
          timeout: timeout,
          maximumAge: maximumAge,
        });
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
