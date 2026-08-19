export type BrowserKeyboardEventInfo = {
  key: string;
  code: string;
  repeat: boolean;
  location: number;
  modifiers: {
    alt: boolean;
    shift: boolean;
    ctrl: boolean;
    meta: boolean;
  };
};
export type BrowserPointerEventInfo = {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  offsetX: number;
  offsetY: number;
  buttons: number;
  pressure: number;
  pointerId: number;
  pointerType: string;
};
