/**
 * **HollowDB client.**
 *
 * HollowDB client provides a very simple interface, abstracting everything behind
 * the scenes. You can do the 4 basic CRUD operations as shown below:
 *
 * ```ts
 * # GET
 * await client.get(KEY);
 *
 * # PUT
 * await client.put(KEY, VALUE);
 *
 * # UPDATE
 * await client.update(KEY, VALUE);
 *
 * # REMOVE
 * await client.remove(KEY);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HollowClient<T = any> {
  /**
   * **Returns the value at the given key.**
   *
   * This operation does not require proofs even if zero-knowledge is enabled.
   */
  get: (key: string) => Promise<T>;

  /**
   * **Puts a value at the given key.**
   *
   * The target key must be empty, i.e. this is not an upsert operation.
   *
   * This operation does not require proofs even if zero-knowledge is enabled.
   */
  put: (key: string, value: T) => Promise<void>;

  /** **Updates a value at the given key.**
   *
   * If zero-knowledge proofs are enabled, a proof will be created automatically
   * and be provided within the payload to the server. The proof does not reveal
   * the client `secret` in any means.
   */
  update: (key: string, value: T) => Promise<void>;

  /** **Removes a value at the given key.**
   *
   * Subsequent `get` calls to this key shall return `null`.
   *
   * If zero-knowledge proofs are enabled, a proof will be created automatically
   * and be provided within the payload to the server. The proof does not reveal
   * the client `secret` in any means.
   */
  remove: (key: string) => Promise<void>;
}

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
  zkOptions?: {
    secret: string;
    protocol: 'groth16' | 'plonk';
  };
};
