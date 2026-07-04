export function capitalizeFirst(text: string | null): string {
  if (!text) {
    return '';
  }

  const normalized = text.trim();

  if (!normalized) {
    return '';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function capitalizeWords(text: string | null): string {
  if (!text) {
    return '';
  }

  const words = text.trim().split(/\s+/);
  const capitalizedWords = words.map((w) => capitalizeFirst(w));

  return capitalizedWords.join(' ');
}

type StringKeys<T> = {
  [P in keyof T]: NonNullable<T[P]> extends string ? P : never;
}[keyof T];

export function capitalizeTextFields<T extends Record<string, any>>(config: {
  data: T;
  first?: StringKeys<T>[];
  words?: StringKeys<T>[];
}): T {
  const { data, first = [], words = [] } = config;

  const result = { ...data };

  first.forEach((key) => {
    result[key] = capitalizeFirst((data[key] ?? null) as string | null) as T[typeof key];
  });

  words.forEach((key) => {
    result[key] = capitalizeWords((data[key] ?? null) as string | null) as T[typeof key];
  });

  return result;
}
