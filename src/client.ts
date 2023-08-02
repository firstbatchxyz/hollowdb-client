import {getToken} from './utilities';
import {HollowDBError} from './errors';

/**
 * To authenticate yourself, you need to provide the following:
 *
 * - `apiKey` belonging to your team.
 * - `db` database name to connect to.
 *
 * Additionally, you can choose the zero-knowledge proof system to be used
 * along with a secret to generate proofs and derive keys.
 *
 * - `zkOptions.secret` will be your secret. This should not leave the client-side any time.
 * - `zkOptions.protocol` is Groth16 or PLONK. We provide prover keys & WASM files for both of them.
 */
export type HollowClientOptions = {
  apiKey: string;
  db: string;
};

// TODO: change to the real url / provide option?
const BASE_URL = 'http://localhost:3000';

/**
 * **[HollowDB Client](https://docs.hollowdb.xyz/hollowdb/hollowdb-as-a-service#hollowdb-client)**
 *
 * HollowDB client provides a very simple interface, abstracting everything behind
 * the scenes. You can do the 4 basic CRUD operations as shown below:
 *
 * ```ts
 * await client.get(KEY);
 * await client.put(KEY, VALUE);
 * await client.update(KEY, VALUE);
 * await client.remove(KEY);
 * ```
 *
 * You can also do multi-operations:
 *
 * ```ts
 * await client.getMulti([KEY1, KEY2, ...]);
 * await client.putMulti([(KEY1, VALUE1), (KEY2, VALUE2), ...]);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class HollowClient<T = any> {
  protected readonly apiKey: string;
  protected readonly db: string;
  protected authToken: string;

  // auth token is retrieved by the client code, so it is not provided within `opt`
  private constructor(opt: HollowClientOptions, authToken: string) {
    this.apiKey = opt.apiKey;
    this.authToken = authToken;
    this.db = opt.db;
  }

  /**
   * Creates & authenticates a HollowDB client.
   *
   * ```ts
   * type ValueType = {foo: number, bar: string};
   *
   * client = await HollowClient.new<ValueType>({
   *   apiKey: 'your-api-key',
   *   db: 'your-database-name',
   * });
   * ```
   *
   * You can provide a value type to the function to make all functions treat that type
   * as the value type for your key-value database.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async new<T = any>(
    // TODO: take them one by one instead of options?
    options: HollowClientOptions
  ): Promise<HollowClient<T>> {
    const authToken = await getToken(options.db, options.apiKey);
    return new HollowClient<T>(options, authToken);
  }

  /**
   * **Returns the value at the given key.**
   *
   * This operation does not require proofs.
   */
  public async get(key: string): Promise<T> {
    const encodedKey = encodeURIComponent(key);
    const response = await this.fetch<{result: T}>(
      `${BASE_URL}/get/${encodedKey}`,
      'GET'
    );

    if (!response.data) {
      // TODO: what should be the error message?
      throw new HollowDBError({
        message: 'No data at this key',
      });
    }

    return response.data.result;
  }

  /**
   * **Returns the value at the given keys.**
   *
   * This operation does not require proofs.
   *
   * The returned array is an array of values where `value[i]` is
   * belongs to `key[i]`. If a key does not exist, `null` is returned
   * for that key.
   */
  public async getMulti(keys: string[]): Promise<T[]> {
    const response = await this.fetch<{result: T[]}>(
      `${BASE_URL}/mget`,
      'POST',
      JSON.stringify({keys})
    );

    return response.data.result;
  }

  /**
   * **Puts a value at the given key.**
   *
   * The target key must be empty, i.e. this is not an upsert operation.
   *
   * This operation does not require proofs even if zero-knowledge is enabled.
   */
  public async put(key: string, value: T) {
    await this.fetch(`${BASE_URL}/put`, 'POST', JSON.stringify({key, value}));
  }

  /**
   * **Puts an array of key-value pairs.**
   *
   * The target keys must be empty, i.e. this is not an upsert operation.
   *
   * This operation does not require proofs even if zero-knowledge is enabled.
   *
   * Returns an array of booleans that indicate whether each key-value pair has
   * been succesfully put or not.
   *
   * THIS FUNCTION IS `private` UNTIL BACKEND IS READY
   */
  private async putMulti(pairs: {key: string; value: T}[]): Promise<boolean[]> {
    const response = await this.fetch<{result: boolean[]}>(
      `${BASE_URL}/mput`,
      'POST',
      JSON.stringify({pairs})
    );

    return response.data.result;
  }

  /** **Updates a value at the given key.**
   *
   * A zero-knowledge proof is optionally provided, which the service
   * expects if the connected database has proofs enabled.
   */
  public async update(key: string, value: T, proof?: object) {
    await this.fetch(
      `${BASE_URL}/update`,
      'POST',
      JSON.stringify({key, value, proof})
    );
  }

  /** **Removes a value at the given key.**
   *
   * Subsequent `get` calls to this key shall return `null`.
   *
   * A zero-knowledge proof is optionally provided, which the service
   * expects if the connected database has proofs enabled.
   */
  public async remove(key: string, proof?: object) {
    await this.fetch(
      `${BASE_URL}/remove`,
      'POST',
      JSON.stringify({key, proof})
    );
  }

  /** Fetch utility for internal use. */
  private async fetch<Data = undefined>(
    url: string,
    method: 'GET' | 'POST',
    body?: BodyInit
  ): Promise<{
    message: string;
    data: Data;
    newBearer?: string;
  }> {
    const init: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${this.authToken}`,
      },
      method,
    };
    if (body) init.body = body;

    const response = await fetch(url, init);
    const json = await response.json();

    if (response.status === 200) {
      // new bearer has been created due to expiration of previous
      if (json.newBearer !== undefined) {
        this.authToken = json.newBearer;
      }
      return json;
    } else if (json.message === 'token expired') {
      // token has expired, client must initiate the new token request
      this.authToken = await getToken(this.db, this.apiKey);
      return json;
    }

    throw new HollowDBError({
      message: `${url}: Status: ${response.status} Error: ${json.message}`,
    });
  }
}
