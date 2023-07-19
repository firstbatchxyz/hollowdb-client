import {Base} from './base';
import {HollowDBError} from '../errors';

import type {HollowClientOptions, ServerResponse} from '../interfaces';

export class Client<T> extends Base<T> {
  constructor(opt: HollowClientOptions, authToken: string) {
    super(opt, authToken);
  }

  public async get(key: string): Promise<T> {
    const response: ServerResponse<T, 'read'> = await this.fetchHandler({
      op: 'get',
      key,
    });

    if (response.data) {
      return response.data.result;
    }

    throw new HollowDBError({
      message: 'HollowDB Get Error: Unknown error',
    });
  }

  public async put(key: string, value: T) {
    await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key, value}),
    });
  }

  public async update(key: string, value: T) {
    await this.fetchHandler({
      op: 'update',
      body: JSON.stringify({key, value}),
    });
  }

  public async remove(key: string) {
    await this.fetchHandler({
      op: 'remove',
      body: JSON.stringify({key}),
    });
  }
}
