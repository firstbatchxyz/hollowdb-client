export interface IHollowClient {
  get: (key: string) => Promise<string | object>;
  put: (key: string, value: string | object) => Promise<void>;
  update: (key: string, value: string | object) => Promise<void>;
  remove: (key: string) => Promise<void>;
}
