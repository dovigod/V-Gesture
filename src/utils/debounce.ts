interface DebounceOptions {
  signal?: AbortSignal;
}

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  debounceMs: number,
  { signal }: DebounceOptions = {}
): F & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (...args: Parameters<F>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (signal?.aborted) {
      return;
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, debounceMs);
  } as F & { cancel: () => void };

  const onAbort = function () {
    debounced.cancel();
  };

  debounced.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  signal?.addEventListener('abort', onAbort, { once: true });

  return debounced;
}