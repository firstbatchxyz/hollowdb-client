import {Client} from './clients/client';
import {ZkClient} from './clients/zkclient';

import type {HollowClientOptions} from './interfaces/options.interface';
import type {IHollowClient} from './interfaces/client.interface';

export class HollowFactory {
  private readonly authUrl = 'auth.hollowdb.io'; //TODO: change to the real url
  private readonly useZk: boolean = false;

  private static authToken: string;

  private constructor(opt: HollowClientOptions) {
    if (opt.zkOptions) this.useZk = true;
  }

  public static async createAsync(
    opt: HollowClientOptions
  ): Promise<IHollowClient> {
    const client = new HollowFactory(opt);

    HollowFactory.authToken = await client.getAuthToken();

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

  private async getAuthToken() {
    // const response = await fetch(`${this.authUrl}/auth`, {
    //   method: 'GET',
    //   headers: HollowClient.hollowHeader,
    //   body: JSON.stringify({db: this.db, apiKey: HollowClient.apiKey}),
    // });

    // const {token} = await response.json();

    // return token as string;

    // temp solution for demo purposes
    await sleep(1500);

    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwZXJtaXNzaW9ucyI6eyJhbGxvd1pLIjp0cnVlLCJtYXhSZWFkTGltaXQiOjEwMDAwMDAwMDAwMDAwMDAwMDAsIm1heFdyaXRlTGltaXQiOjEwMDAwMDAwMDAwMDAwMDAwMDB9LCJjb250cmFjdFR4SWQiOiJsRExtX2t2WlN6WndnT2JrX2Z6OVlqbTJQVTY0OU1mcHg5ZWRwZlI1eG5VIiwiYXBpS2V5IjoiMDMyYzE3ZGRiODc0OTA0ZjExMjA1N2JkYTkwODJjMjgifQ.7iFBzENcJUeJSmPvgn6r8HMNIIJXw5E_tupHhAQF5_0';
  }
}

//TODO: remove this
function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// export type {HollowClientOptions, IHollowClient};
// export {HollowFactory};
