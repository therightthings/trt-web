type StringKeys<T> = {
  [P in keyof T]: NonNullable<T[P]> extends string ? P : never;
}[keyof T];

type CapitalizeStringConfig = {
  mode?: 'first' | 'words';
};

type CapitalizeObjectConfig<T extends Record<string, unknown>> = {
  first?: StringKeys<T>[];
  words?: StringKeys<T>[];
};

function capitalizeString(text: string, config?: CapitalizeStringConfig): string {
  const normalized = text.trim();

  if (!normalized) {
    return '';
  }

  const mode = config?.mode ?? 'first';

  if (mode === 'words') {
    return normalized
      .split(/\s+/)
      .map((word) => capitalizeString(word))
      .join(' ');
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function capitalizeObject<T extends Record<string, unknown>>(
  data: T,
  config?: CapitalizeObjectConfig<T>,
): T {
  const result = { ...data };

  config?.first?.forEach((key) => {
    Object.assign(result, { [key]: capitalizeString(String(data[key] ?? '')) });
  });

  config?.words?.forEach((key) => {
    Object.assign(result, { [key]: capitalizeString(String(data[key] ?? ''), { mode: 'words' }) });
  });

  return result;
}

export function capitalize(data: string, config?: CapitalizeStringConfig): string;
export function capitalize<T extends Record<string, unknown>>(
  data: T,
  config?: CapitalizeObjectConfig<T>,
): T;
export function capitalize(
  data: string | Record<string, unknown>,
  config?: CapitalizeStringConfig | CapitalizeObjectConfig<Record<string, unknown>>,
): string | Record<string, unknown> {
  if (typeof data === 'string') {
    return capitalizeString(data, config as CapitalizeStringConfig);
  }

  return capitalizeObject(data, config as CapitalizeObjectConfig<Record<string, unknown>>);
}
