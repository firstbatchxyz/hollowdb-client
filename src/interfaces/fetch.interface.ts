export interface IFetchHandler {
  op: 'put' | 'update' | 'remove' | 'get';
  key?: string;
  body?: BodyInit;
}
