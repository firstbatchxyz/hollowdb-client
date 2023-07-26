import {Client} from './client';
import {ZkClient} from './zkclient';
import {getToken} from './utilities';
import type {HollowClient, HollowClientOptions} from './interfaces';

/**
 * **Creates & authenticates a HollowDB client.**
 *
 * You can create the client without using zero-knowledge proofs:
 *
 * ```ts
 * client = await createHollowClient({
 *   apiKey: 'your-api-key',
 *   db: 'your-database-name',
 * });
 *
 * or you can provide `zkOptions` to enable zero-knowledge proofs:
 *
 * ```ts
 * client = await createHollowClient({
 *   apiKey: 'your-api-key',
 *   db: 'your-database-name',
 *   zkOptions: {
 *     protocol: 'groth16', // or 'plonk'
 *     secret: "your-secret,
 *   },
 * });
 * ```
 *
 * You can provide a value type to the function to make all functions treat that type
 * as the value type for your key-value database.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createHollowClient<T = any>(
  options: HollowClientOptions
): Promise<HollowClient<T>> {
  const authToken = await getToken(options.db, options.apiKey);

  if (options.zkOptions) {
    if (!options.zkOptions.protocol || !options.zkOptions.secret) {
      throw new Error('Protocol and preimage are required for zk');
    }
    return new ZkClient<T>(options, authToken);
  } else {
    return new Client<T>(options, authToken);
  }
}

export type {HollowClientOptions, HollowClient};
export {createHollowClient};
