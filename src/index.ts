import {Client} from './clients/client';
import {ZkClient} from './clients/zkclient';
import {getToken} from './utilities/tokengetter';

import type {HollowClientOptions} from './interfaces/options.interface';
import type {IHollowClient} from './interfaces/client.interface';

class HollowClient {
  // private readonly authUrl = 'https://auth.firstbatch.xyz/hollow/create_bearer';
  private readonly useZk: boolean = false;

  // private static authToken: string;

  private constructor(opt: HollowClientOptions) {
    if (opt.zkOptions) this.useZk = true;
  }

  public static async createAsync(
    opt: HollowClientOptions
  ): Promise<IHollowClient> {
    const client = new HollowClient(opt);

    // const authToken = await client.getAuthToken(opt);
    const authToken = await getToken(opt.db, opt.apiKey);

    if (client.useZk) {
      if (!opt.zkOptions?.protocol || !opt.zkOptions?.preimage)
        throw new Error('Protocol and preimage are required for zk');

      return new ZkClient(opt, authToken);
    }

    return new Client(opt, authToken);
  }

  // protected async getAuthToken(opt: HollowClientOptions) {
  //   const response = await fetch(`${this.authUrl}?db=${opt.db}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'x-api-key': opt.apiKey,
  //     },
  //   });

  //   if (!response.ok)
  //     throw new Error(
  //       'Server responded with a status code: ' + response.status
  //     );
  //   const {bearerToken} = await response.json();

  //   if (!bearerToken) throw new Error('Failed to get auth token');

  //   return bearerToken as string;
  // }
}

export type {HollowClientOptions, IHollowClient};
export {HollowClient};
