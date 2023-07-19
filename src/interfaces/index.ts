// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HollowClient<T = any> {
  get: (key: string) => Promise<T>;

  /** todo: write docs here, they will be visible on all clients */
  put: (key: string, value: T) => Promise<void>;

  update: (key: string, value: T) => Promise<void>;

  remove: (key: string) => Promise<void>;
}

export type HollowClientOptions = {
  apiKey: string;
  db: string;
  zkOptions?: {
    secret: string;
    protocol: 'groth16' | 'plonk';
  };
};
