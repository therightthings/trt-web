export abstract class AbstractBrowserUtils {
  static isSupported(): boolean {
    throw new Error('Browser utility must implement isSupported().');
  }
}

export type BrowserSubscription = {
  unsubscribe(): void;
};
