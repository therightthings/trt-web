export function generateRandomString(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
