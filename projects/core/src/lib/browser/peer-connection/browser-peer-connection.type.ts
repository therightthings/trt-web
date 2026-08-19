export type BrowserPeerConnectionConfig = RTCConfiguration;
export type BrowserPeerConnectionIceCandidateInit = RTCIceCandidateInit;
export type BrowserPeerConnectionSessionDescriptionInit = RTCSessionDescriptionInit;
export type BrowserPeerConnectionDataChannelInit = RTCDataChannelInit;
export type BrowserPeerConnectionHandlers = {
  onTrack?: (event: RTCTrackEvent) => void;
  onIceCandidate?: (event: RTCPeerConnectionIceEvent) => void;
  onIceConnectionStateChange?: (event: Event) => void;
  onConnectionStateChange?: (event: Event) => void;
  onSignalingStateChange?: (event: Event) => void;
  onDataChannel?: (event: RTCDataChannelEvent) => void;
};

export type BrowserPeerConnectionOptions = {
  config?: BrowserPeerConnectionConfig;
  handlers?: BrowserPeerConnectionHandlers;
};

export type BrowserPeerConnectionDataChannelOptions = {
  label: string;
  options?: BrowserPeerConnectionDataChannelInit;
};

export type BrowserPeerConnectionOfferOptions = {
  offer: RTCSessionDescriptionInit;
  config?: BrowserPeerConnectionConfig;
  handlers?: BrowserPeerConnectionHandlers;
};
