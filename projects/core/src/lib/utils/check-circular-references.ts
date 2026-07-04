export function checkCircularReferences(value: unknown): void {
  const seen = new WeakSet<object>();

  const walk = (currentValue: unknown): void => {
    if (currentValue === null || typeof currentValue !== 'object') {
      return;
    }

    if (
      currentValue instanceof Date ||
      currentValue instanceof RegExp ||
      currentValue instanceof Map ||
      currentValue instanceof Set
    ) {
      return;
    }

    if (seen.has(currentValue)) {
      throw new Error('Circular reference detected');
    }

    seen.add(currentValue);

    try {
      if (Array.isArray(currentValue)) {
        for (const item of currentValue) {
          walk(item);
        }

        return;
      }

      if (currentValue instanceof Map) {
        for (const [key, nestedValue] of currentValue.entries()) {
          walk(key);
          walk(nestedValue);
        }

        return;
      }

      if (currentValue instanceof Set) {
        for (const nestedValue of currentValue.values()) {
          walk(nestedValue);
        }

        return;
      }

      for (const nestedValue of Object.values(currentValue)) {
        walk(nestedValue);
      }
    } finally {
      seen.delete(currentValue);
    }
  };

  walk(value);
}
