declare module 'lru-cache' {
  export class LRUCache<K, V> {
    constructor(options?: any);
    set(key: K, value: V): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): void;
    clear(): void;
    readonly size: number;
    readonly stats?: {
      hitRate: number;
      [key: string]: any;
    }
  }
}