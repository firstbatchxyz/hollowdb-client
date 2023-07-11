import type {IServerResponse} from './response.interface';

export interface IHollowClient {
  get: (key: string) => Promise<IServerResponse<'get'>>;
  put: (
    key: string,
    value: string | object
  ) => Promise<IServerResponse<'write'>>;
  update: (
    key: string,
    value: string | object
  ) => Promise<IServerResponse<'write'>>;
  remove: (key: string) => Promise<IServerResponse<'write'>>;
}
