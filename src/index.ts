import {Client} from './clients/client';
import {ZkClient} from './clients/zkclient';

import type {HollowClientOptions} from './interfaces/options.interface';
import type {IHollowClient} from './interfaces/client.interface';

export type {HollowClientOptions};

export class HollowClient {
  private static authToken: string;
  private readonly useZk: boolean = false;

  private constructor(opt: HollowClientOptions) {
    if (opt.zkOptions) {
      this.useZk = true;
    }
  }

  public static async createAsync(
    opt: HollowClientOptions
  ): Promise<IHollowClient> {
    const client = new HollowClient(opt);

    HollowClient.authToken = await client.getAuthToken();

    if (client.useZk) {
      if (!opt.zkOptions?.protocol || !opt.zkOptions?.preimage)
        throw new Error('Protocol and preimage are required for zk');

      return new ZkClient(
        opt.apiKey,
        HollowClient.authToken,
        opt.zkOptions.protocol,
        opt.zkOptions.preimage
      );
    }

    return new Client(opt.apiKey, HollowClient.authToken);
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

// export async function HollowFactory(opt: HollowClientOptions) {
//   const authToken = await getAuthToken(opt);

//   if (!opt.zkOptions) {
//     return new Client(opt.apiKey, authToken);
//   }

//   return new ZkClient(
//     opt.apiKey,
//     authToken,
//     opt.zkOptions.protocol,
//     opt.zkOptions.preimage
//   );
// }

// async function getAuthToken(opt: HollowClientOptions) {
//   // const response = await fetch(`${this.authUrl}/auth`, {
//   //   method: 'GET',
//   //   headers: HollowClient.hollowHeader,
//   //   body: JSON.stringify({db: this.db, apiKey: HollowClient.apiKey}),
//   // });

//   // const {token} = await response.json();

//   // return token as string;

//   // temp solution for demo purposes
//   await sleep(1500);

//   return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwZXJtaXNzaW9ucyI6eyJhbGxvd1pLIjp0cnVlLCJtYXhSZWFkTGltaXQiOjEwMDAwMDAwMDAwMDAwMDAwMDAsIm1heFdyaXRlTGltaXQiOjEwMDAwMDAwMDAwMDAwMDAwMDB9LCJjb250cmFjdFR4SWQiOiJsRExtX2t2WlN6WndnT2JrX2Z6OVlqbTJQVTY0OU1mcHg5ZWRwZlI1eG5VIiwiYXBpS2V5IjoiMDMyYzE3ZGRiODc0OTA0ZjExMjA1N2JkYTkwODJjMjgifQ.7iFBzENcJUeJSmPvgn6r8HMNIIJXw5E_tupHhAQF5_0';
// }

//TODO: remove this
function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
