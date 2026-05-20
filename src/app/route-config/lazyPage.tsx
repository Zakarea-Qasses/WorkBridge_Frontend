import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export function lazyPage<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(loader);
}
