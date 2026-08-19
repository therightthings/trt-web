export type BrowserBluetoothUUID = string | number;
export type BrowserBluetoothRequestFilter = {
  services?: BrowserBluetoothUUID[];
  name?: string;
  namePrefix?: string;
  manufacturerData?: {
    companyIdentifier: number;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }[];
  serviceData?: {
    service: BrowserBluetoothUUID;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }[];
};
export type BrowserBluetoothRequestOptions = {
  filters?: BrowserBluetoothRequestFilter[];
  optionalServices?: BrowserBluetoothUUID[];
  acceptAllDevices?: boolean;
};
export type BrowserBluetoothChangeHandler = (event: Event) => void;
export type BrowserBluetoothCharacteristicEventHandler = (event: Event) => void;
export type BrowserBluetoothCharacteristicProperties = {
  broadcast: boolean;
  read: boolean;
  writeWithoutResponse: boolean;
  write: boolean;
  notify: boolean;
  indicate: boolean;
  authenticatedSignedWrites: boolean;
  reliableWrite: boolean;
  writableAuxiliaries: boolean;
};
export type BrowserBluetoothRemoteGATTCharacteristic = {
  readValue(): Promise<DataView>;
  readValue(): Promise<DataView>;
  writeValueWithResponse(value: BufferSource): Promise<void>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BrowserBluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<void>;
  readonly uuid: string;
  readonly properties: BrowserBluetoothCharacteristicProperties;
} & EventTarget;
export type BrowserBluetoothRemoteGATTService = {
  getCharacteristic(
    characteristic: BrowserBluetoothUUID,
  ): Promise<BrowserBluetoothRemoteGATTCharacteristic>;
  getCharacteristics(): Promise<BrowserBluetoothRemoteGATTCharacteristic[]>;
};
export type BrowserBluetoothRemoteGATTServer = {
  readonly connected: boolean;
  connect(): Promise<BrowserBluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTService>;
};
export type BrowserBluetoothDevice = {
  readonly id: string;
  readonly gatt: BrowserBluetoothRemoteGATTServer | null;
} & EventTarget;
export interface BrowserBluetoothApi {
  getAvailability(): Promise<boolean>;
  getDevices(): Promise<BrowserBluetoothDevice[]>;
  requestDevice(options?: BrowserBluetoothRequestOptions): Promise<BrowserBluetoothDevice>;
}
export type BrowserBluetoothNavigator = Navigator & { bluetooth?: BrowserBluetoothApi };
export type BrowserBluetoothWritePayload = {
  service: BrowserBluetoothUUID;
  characteristic: BrowserBluetoothUUID;
  value: BufferSource;
};
export type BrowserBluetoothWriteConfig = {
  withoutResponse?: boolean;
  server?: BrowserBluetoothRemoteGATTServer;
};
export type BrowserBluetoothNotificationPayload = {
  service: BrowserBluetoothUUID;
  characteristic: BrowserBluetoothUUID;
};
export type BrowserBluetoothNotificationConfig = {
  onCharacteristicValueChanged?: BrowserBluetoothCharacteristicEventHandler;
  onDisconnect?: BrowserBluetoothChangeHandler;
  server?: BrowserBluetoothRemoteGATTServer;
};
export type BrowserBluetoothStopNotificationPayload = {
  characteristic: BrowserBluetoothRemoteGATTCharacteristic;
};
export type BrowserBluetoothStopNotificationConfig = {
  onCharacteristicValueChanged?: BrowserBluetoothCharacteristicEventHandler;
  onDisconnect?: BrowserBluetoothChangeHandler;
};
export type BrowserBluetoothReadPayload = {
  service: BrowserBluetoothUUID;
  characteristic: BrowserBluetoothUUID;
};
export type BrowserBluetoothReadConfig = {
  server?: BrowserBluetoothRemoteGATTServer;
};
