export interface HollowClient<T> {
  get: (key: string) => Promise<T>;

  /** todo: write docs here, they will be visible on all clients */
  put: (key: string, value: T) => Promise<void>;

  update: (key: string, value: T) => Promise<void>;

  remove: (key: string) => Promise<void>;
}
