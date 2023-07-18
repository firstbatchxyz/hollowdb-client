export type IFetchHandler =
  | {
      op: 'get';
      key: string;
    }
  | {
      op: 'put' | 'update' | 'remove';
      body: BodyInit;
    };
