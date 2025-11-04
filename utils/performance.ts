import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs, auto-save, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * Ensures function is called at most once per specified interval
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook to batch state updates
 * Useful when you need to update multiple pieces of state at once
 */
export function useBatchedState<T>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState<T>(initialState);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return [state, batchUpdate];
}

/**
 * Hook to track previous value
 * Useful for comparing previous and current values
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook for safe async operations
 * Prevents memory leaks from setting state on unmounted components
 */
export function useSafeAsync<T>() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback(
    <S>(setter: React.Dispatch<React.SetStateAction<S>>, value: S) => {
      if (isMountedRef.current) {
        setter(value);
      }
    },
    []
  );

  return { isMounted: isMountedRef, safeSetState };
}

/**
 * Hook for lazy loading with intersection observer
 * Note: IntersectionObserver is not available in React Native
 * Use onEndReached for FlatList instead
 * This is kept for potential web version
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: any
) {
  const targetRef = useRef<any>(null);

  useEffect(() => {
    // This is a placeholder for potential web version
    // In React Native, use FlatList's onEndReached instead
    console.warn('useIntersectionObserver is not implemented for React Native. Use FlatList onEndReached.');
  }, [callback, options]);

  return targetRef;
}

/**
 * Batch multiple API calls and execute them in parallel
 * Returns results in the same order as requests
 */
export async function batchRequests<T>(
  requests: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((req) => req()));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Retry a failed promise with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Create a memoized selector for expensive computations
 */
export function createSelector<T, R>(
  selector: (data: T) => R
): (data: T) => R {
  let lastInput: T;
  let lastResult: R;

  return (data: T): R => {
    if (data === lastInput) {
      return lastResult;
    }

    lastInput = data;
    lastResult = selector(data);
    return lastResult;
  };
}

/**
 * Image cache for better performance
 */
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 50; // Maximum number of cached images

  get(url: string): string | undefined {
    return this.cache.get(url);
  }

  set(url: string, data: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(url, data);
  }

  clear(): void {
    this.cache.clear();
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }
  
  size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache();

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Measure component render performance
 */
export function measurePerformance(componentName: string) {
  if (__DEV__) {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      if (duration > 16) { // Slower than 60fps
        console.warn(`${componentName} render took ${duration}ms`);
      }
    };
  }
  
  return () => {}; // No-op in production
}

