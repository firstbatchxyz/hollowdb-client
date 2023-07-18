export interface IServerResponse<
  T,
  M extends 'get' | 'write' = 'get' | 'write'
> {
  message: string;
  data?: M extends 'get' ? {result: T} : undefined;
  newBearer?: string;
}

export interface IAuthResponse {
  message?: string;
  bearerToken?: string;
}
