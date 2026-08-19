import { isType, requireBrowserEnv, toError } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type {
  BrowserBluetoothApi,
  BrowserBluetoothChangeHandler,
  BrowserBluetoothDevice,
  BrowserBluetoothNavigator,
  BrowserBluetoothNotificationConfig,
  BrowserBluetoothNotificationPayload,
  BrowserBluetoothReadConfig,
  BrowserBluetoothReadPayload,
  BrowserBluetoothRemoteGATTCharacteristic,
  BrowserBluetoothRemoteGATTServer,
  BrowserBluetoothRemoteGATTService,
  BrowserBluetoothRequestOptions,
  BrowserBluetoothStopNotificationConfig,
  BrowserBluetoothStopNotificationPayload,
  BrowserBluetoothUUID,
  BrowserBluetoothWriteConfig,
  BrowserBluetoothWritePayload,
} from './browser-bluetooth.type';

/**
 * Bluetooth device connection and GATT helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth
 */
export class BrowserBluetooth extends AbstractBrowserUtils {
  private static device?: BrowserBluetoothDevice;
  private static server?: BrowserBluetoothRemoteGATTServer;
  private static disconnectHandler?: BrowserBluetoothChangeHandler;

  static override isSupported(): boolean {
    requireBrowserEnv();

    if (!window.isSecureContext) {
      return false;
    }

    return isType('object', navigator, 'bluetooth');
  }

  private static get bluetooth(): BrowserBluetoothApi | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return (navigator as BrowserBluetoothNavigator).bluetooth;
  }

  static async isAvailable(): Promise<boolean> {
    const bluetooth = this.bluetooth;
    if (!bluetooth?.getAvailability) {
      return false;
    }

    try {
      return await bluetooth.getAvailability();
    } catch (error) {
      console.error(toError(error, 'Could not read Bluetooth availability.'));
      return false;
    }
  }

  static async getPairedDevices(): Promise<BrowserBluetoothDevice[]> {
    const bluetooth = this.bluetooth;
    if (!bluetooth?.getDevices) {
      return [];
    }

    try {
      return await bluetooth.getDevices();
    } catch (error) {
      console.error(toError(error, 'Could not read paired Bluetooth devices.'));
      return [];
    }
  }

  static async requestDevice(
    options?: BrowserBluetoothRequestOptions,
  ): Promise<BrowserBluetoothDevice | undefined> {
    const bluetooth = this.bluetooth;
    if (!bluetooth?.requestDevice) {
      return undefined;
    }

    try {
      const device = await bluetooth.requestDevice(options);
      if (this.device && this.disconnectHandler) {
        this.device.removeEventListener('gattserverdisconnected', this.disconnectHandler);
      }

      this.device = device;

      const onDisconnect = () => {
        if (this.device?.id === device.id) {
          this.server = undefined;
        }
      };

      this.disconnectHandler = onDisconnect;
      device.addEventListener('gattserverdisconnected', onDisconnect);
      return device;
    } catch (error) {
      console.error(toError(error, 'Could not request Bluetooth device.'));
      return undefined;
    }
  }

  static async connect(
    device?: BrowserBluetoothDevice,
  ): Promise<BrowserBluetoothRemoteGATTServer | undefined> {
    const target = device ?? this.device;
    if (!target?.gatt) {
      return undefined;
    }

    try {
      const server = await target.gatt.connect();
      this.device = target;
      this.server = server;
      return server;
    } catch (error) {
      console.error(toError(error, 'Could not connect to Bluetooth device.'));
      return undefined;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.server?.connected) {
      try {
        this.server.disconnect();
      } catch (error) {
        console.error(toError(error, 'Could not disconnect Bluetooth device.'));
      }
    }

    this.server = undefined;
  }

  static isConnected(): boolean {
    return Boolean(this.server?.connected);
  }

  static getDevice(): BrowserBluetoothDevice | undefined {
    return this.device;
  }

  static getServer(): BrowserBluetoothRemoteGATTServer | undefined {
    return this.server;
  }

  static async getPrimaryService(
    service: BrowserBluetoothUUID,
    server?: BrowserBluetoothRemoteGATTServer,
  ): Promise<BrowserBluetoothRemoteGATTService | undefined> {
    const target = server ?? this.server;
    if (!target?.connected) {
      return undefined;
    }

    try {
      return await target.getPrimaryService(service);
    } catch (error) {
      console.error(toError(error, 'Could not get Bluetooth service.'));
      return undefined;
    }
  }

  static async getCharacteristic(
    service: BrowserBluetoothUUID,
    characteristic: BrowserBluetoothUUID,
    server?: BrowserBluetoothRemoteGATTServer,
  ): Promise<BrowserBluetoothRemoteGATTCharacteristic | undefined> {
    const targetService = await this.getPrimaryService(service, server);
    if (!targetService) {
      return undefined;
    }

    try {
      return await targetService.getCharacteristic(characteristic);
    } catch (error) {
      console.error(toError(error, 'Could not get Bluetooth characteristic.'));
      return undefined;
    }
  }

  static async getCharacteristics(
    service: BrowserBluetoothUUID,
    server?: BrowserBluetoothRemoteGATTServer,
  ): Promise<BrowserBluetoothRemoteGATTCharacteristic[]> {
    const targetService = await this.getPrimaryService(service, server);
    if (!targetService) {
      return [];
    }

    try {
      return await targetService.getCharacteristics();
    } catch (error) {
      console.error(toError(error, 'Could not get Bluetooth characteristics.'));
      return [];
    }
  }

  static async readValue(
    payload: BrowserBluetoothReadPayload,
    config?: BrowserBluetoothReadConfig,
  ): Promise<DataView | undefined> {
    const { service, characteristic } = payload;
    const { server } = config ?? {};
    const targetCharacteristic = await this.getCharacteristic(service, characteristic, server);
    if (!targetCharacteristic) {
      return undefined;
    }

    try {
      return await targetCharacteristic.readValue();
    } catch (error) {
      console.error(toError(error, 'Could not read Bluetooth characteristic.'));
      return undefined;
    }
  }

  static async writeValue(
    payload: BrowserBluetoothWritePayload,
    config?: BrowserBluetoothWriteConfig,
  ): Promise<boolean> {
    const { service, characteristic, value } = payload;
    const { withoutResponse = false, server } = config ?? {};
    const targetCharacteristic = await this.getCharacteristic(service, characteristic, server);
    if (!targetCharacteristic) {
      return false;
    }

    try {
      if (withoutResponse) {
        await targetCharacteristic.writeValueWithoutResponse(value);
      } else {
        await targetCharacteristic.writeValueWithResponse(value);
      }

      return true;
    } catch (error) {
      console.error(toError(error, 'Could not write Bluetooth characteristic.'));
      return false;
    }
  }

  static async startNotifications(
    payload: BrowserBluetoothNotificationPayload,
    config?: BrowserBluetoothNotificationConfig,
  ): Promise<BrowserBluetoothRemoteGATTCharacteristic | undefined> {
    const { service, characteristic } = payload;
    const { onCharacteristicValueChanged, onDisconnect, server } = config ?? {};
    const targetCharacteristic = await this.getCharacteristic(service, characteristic, server);
    if (!targetCharacteristic) {
      return undefined;
    }

    try {
      if (onCharacteristicValueChanged) {
        targetCharacteristic.addEventListener(
          'characteristicvaluechanged',
          onCharacteristicValueChanged,
        );
      }

      if (onDisconnect) {
        this.device?.addEventListener('gattserverdisconnected', onDisconnect);
      }

      await targetCharacteristic.startNotifications();
      return targetCharacteristic;
    } catch (error) {
      console.error(toError(error, 'Could not start Bluetooth notifications.'));
      return undefined;
    }
  }

  static stopNotifications(
    payload: BrowserBluetoothStopNotificationPayload,
    config?: BrowserBluetoothStopNotificationConfig,
  ): void {
    const { characteristic } = payload;
    const { onCharacteristicValueChanged, onDisconnect } = config ?? {};

    if (onCharacteristicValueChanged) {
      characteristic.removeEventListener(
        'characteristicvaluechanged',
        onCharacteristicValueChanged,
      );
    }

    if (onDisconnect && this.device) {
      this.device.removeEventListener('gattserverdisconnected', onDisconnect);
    }

    void characteristic.stopNotifications().catch((error) => {
      console.error(toError(error, 'Could not stop Bluetooth notifications.'));
    });
  }
}
