import {Base} from '../base';
import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';

export class Client extends Base {
  constructor(opt: HollowClientOptions, authToken: string) {
    super(opt, authToken);
  }

  public async update(
    key: string,
    value: string | object
  ): Promise<IServerResponse<'write'>> {
    return await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key, value}),
    });
  }

  public async remove(key: string): Promise<IServerResponse<'write'>> {
    return await this.fetchHandler({
      op: 'put',
      key,
    });
  }
}
