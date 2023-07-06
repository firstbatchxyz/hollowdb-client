export interface IServerGetResponse {
  message: string;
  data: {
    result: object | string;
  };
}

export interface IServerWriteResponse {
  message: string;
}
