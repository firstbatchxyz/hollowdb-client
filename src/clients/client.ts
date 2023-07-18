import {Base} from './base';
import {HollowDBError} from '../utilities/errors';

import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';

export class Client extends Base {
  constructor(opt: HollowClientOptions, authToken: string) {
    super(opt, authToken);
  }

  public async get(key: string): Promise<object | string> {
    const response: IServerResponse<'get'> = await this.fetchHandler({
      op: 'get',
      key,
    });

    if (response.data) return response.data.result;

    throw new HollowDBError({
      message: 'HollowDB Get Error: Unknown error',
    });
  }

  public async put(key: string, value: string | object): Promise<void> {
    await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key, value}),
    });
  }

  public async update(key: string, value: string | object): Promise<void> {
    await this.fetchHandler({
      op: 'update',
      body: JSON.stringify({key, value}),
    });
  }

  public async remove(key: string): Promise<void> {
    await this.fetchHandler({
      op: 'remove',
      body: JSON.stringify({key}),
    });
  }
}
