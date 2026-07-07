export function requireBrowserEnv(config?: { message?: string }) {
  const { message = 'This function can only be used in a browser environment.' } = config ?? {};

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(message);
  }

  return true;
}
