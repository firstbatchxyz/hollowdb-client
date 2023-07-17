import {Client} from './clients/client';
import {ZkClient} from './clients/zkclient';
import {getToken} from './utilities/tokengetter';

import type {HollowClientOptions} from './interfaces/options.interface';
import type {IHollowClient} from './interfaces/client.interface';

class HollowClient {
  private readonly useZk: boolean = false;

  private constructor(opt: HollowClientOptions) {
    if (opt.zkOptions) this.useZk = true;
  }

  public static async createAsync(
    opt: HollowClientOptions
  ): Promise<IHollowClient> {
    const client = new HollowClient(opt);

    const authToken = await getToken(opt.db, opt.apiKey);

    if (client.useZk) {
      if (!opt.zkOptions?.protocol || !opt.zkOptions?.secret)
        throw new Error('Protocol and preimage are required for zk');

      return new ZkClient(opt, authToken);
    }

    return new Client(opt, authToken);
  }
}

export type {HollowClientOptions, IHollowClient};
export {HollowClient};
