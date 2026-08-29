export type BrowserNetworkStatus = 'online' | 'offline';
export type BrowserNetworkState = {
  status: BrowserNetworkStatus;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};
export type BrowserNetworkConnection = EventTarget & {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};
export type BrowserNetworkNavigator = Navigator & {
  connection?: BrowserNetworkConnection;
};
