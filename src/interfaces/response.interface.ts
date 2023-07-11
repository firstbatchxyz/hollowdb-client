export interface ResponseCore {
  newBearer?: string;
}

export interface IServerResponse<T extends 'get' | 'write'>
  extends ResponseCore {
  message: string;
  data?: T extends 'get' ? {result: object | string} : undefined;
  newBearer?: string;
}
