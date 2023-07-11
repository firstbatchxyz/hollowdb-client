export interface IServerResponse<T extends 'get' | 'write'> {
  message: string;
  data?: T extends 'get' ? {result: object | string} : undefined;
  newBearer?: string;
}
