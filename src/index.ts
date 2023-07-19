import {Client} from './clients/client';
import {ZkClient} from './clients/zkclient';
import {getToken} from './utilities';

import type {HollowClient, HollowClientOptions} from './interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createHollowClient<T = any>(
  opt: HollowClientOptions
): Promise<HollowClient<T>> {
  const authToken = await getToken(opt.db, opt.apiKey);

  if (opt.zkOptions) {
    if (!opt.zkOptions.protocol || !opt.zkOptions.secret) {
      throw new Error('Protocol and preimage are required for zk');
    }
    return new ZkClient<T>(opt, authToken);
  } else {
    return new Client<T>(opt, authToken);
  }
}

export type {HollowClientOptions, HollowClient};
export {createHollowClient};
