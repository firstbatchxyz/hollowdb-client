export interface HollowClient<T> {
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

export interface ServerResponse<
  T,
  M extends 'read' | 'write' = 'read' | 'write'
> {
  message: string;
  data?: M extends 'read' ? {result: T} : undefined;
  newBearer?: string;
}

export interface AuthResponse {
  message?: string;
  bearerToken?: string;
}