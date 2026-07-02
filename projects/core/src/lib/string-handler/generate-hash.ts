export async function generateHash(data: unknown): Promise<string> {
  if (!data) {
    return '';
  }

  const str = JSON.stringify(data, Object.keys(data).sort());
  const encoded = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
