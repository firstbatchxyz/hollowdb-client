import {Client} from './clients/client';
import {ZkClient} from './clients/zkclient';

import type {HollowClientOptions} from './interfaces/options.interface';
import type {IHollowClient} from './interfaces/client.interface';

class HollowFactory {
  private readonly authUrl = 'https://auth.firstbatch.xyz/hollow/create_bearer';
  private readonly useZk: boolean = false;

  private static authToken: string;

  private constructor(opt: HollowClientOptions) {
    if (opt.zkOptions) this.useZk = true;
  }

  public static async createAsync(
    opt: HollowClientOptions
  ): Promise<IHollowClient> {
    const client = new HollowFactory(opt);

    HollowFactory.authToken = await client.getAuthToken(opt);

    if (client.useZk) {
      if (!opt.zkOptions?.protocol || !opt.zkOptions?.preimage)
        throw new Error('Protocol and preimage are required for zk');

      return new ZkClient(
        opt.apiKey,
        HollowFactory.authToken,
        opt.zkOptions.protocol,
        opt.zkOptions.preimage
      );
    }

    return new Client(opt.apiKey, HollowFactory.authToken);
  }

  private async getAuthToken(opt: HollowClientOptions) {
    const response = await fetch(`${this.authUrl}?db=${opt.db}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': opt.apiKey,
      },
    });

    const {bearerToken} = await response.json();

    if (!bearerToken) throw new Error('Failed to get auth token');

    return bearerToken as string;
  }
}

export type {HollowClientOptions, IHollowClient};
export {HollowFactory};
