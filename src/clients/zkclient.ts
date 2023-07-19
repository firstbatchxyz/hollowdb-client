import path from 'path';
import {createHash} from 'crypto';
import {poseidon1} from 'poseidon-lite';
const snarkjs = require('snarkjs');

import {Base} from './base';
import {HollowDBError} from '../errors';
import type {HollowClientOptions, ServerResponse} from '../interfaces';

export class ZkClient<T> extends Base<T> {
  public readonly protocol: 'groth16' | 'plonk';
  private readonly secret: string;
  private readonly wasmPath: string;
  private readonly proverPath: string;

  constructor(opt: HollowClientOptions, authToken: string) {
    super(opt, authToken);

    if (!opt.zkOptions) {
      throw new Error('Expected zkOptions for zkClient');
    }
    const {protocol, secret} = opt.zkOptions;
    if (protocol === undefined || secret === undefined) {
      throw new Error('Expected protocol and secret for zkClient');
    }

    this.protocol = protocol;
    this.secret = secret;
    this.wasmPath = path.join(
      './node_modules/hollowdb-client/circuits',
      `hollow-authz-${protocol}`,
      'hollow-authz.wasm'
    );
    this.proverPath = path.join(
      './node_modules/hollowdb-client/circuits',
      `hollow-authz-${protocol}`,
      'prover_key.zkey'
    );
  }

  public async get(key: string): Promise<T> {
    const {computedKey} = this.computeHashedKey(key);

    const response: ServerResponse<T, 'read'> = await this.fetchHandler({
      op: 'get',
      key: computedKey,
    });
    if (!response.data) {
      throw new HollowDBError({
        message: 'HollowDB Get Error: Unknown error',
      });
    }

    return response.data.result;
  }

  public async put(key: string, value: T): Promise<void> {
    const {computedKey} = this.computeHashedKey(key);

    await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key: computedKey, value}),
    });
  }

  public async update(key: string, value: T): Promise<void> {
    const {preimage, computedKey} = this.computeHashedKey(key);

    const getResponse: ServerResponse<T, 'read'> = await this.fetchHandler<T>({
      op: 'get',
      key: computedKey,
    });
    if (!getResponse.data) {
      throw new HollowDBError({
        message:
          'HollowDB Update Error: Server Response was OK but data was empty',
      });
    }

    const {proof} = await this.generateProof(
      preimage,
      getResponse.data.result,
      value
    );

    await this.fetchHandler({
      op: 'update',
      body: JSON.stringify({key: computedKey, value, proof}),
    });
  }

  public async remove(key: string): Promise<void> {
    const {preimage, computedKey} = this.computeHashedKey(key);

    const getResponse: ServerResponse<T, 'read'> = await this.fetchHandler({
      op: 'get',
      key: computedKey,
    });
    if (!getResponse.data) {
      throw new HollowDBError({
        message:
          'HollowDB Remove Error: Server Response was OK but data was empty',
      });
    }

    const fullProof = await this.generateProof(
      preimage,
      getResponse.data.result,
      null
    );

    await this.fetchHandler({
      op: 'remove',
      body: JSON.stringify({key: computedKey, proof: fullProof.proof}),
    });
  }

  private async generateProof(
    preimage: bigint,
    curValue: unknown | null,
    nextValue: unknown | null
  ): Promise<{
    proof: object;
    publicSignals: [
      curValueHashOut: string,
      nextValueHashOut: string,
      key: string
    ];
  }> {
    const fullProof = await snarkjs[this.protocol].fullProve(
      {
        preimage,
        curValueHash: curValue ? this.valueToBigInt(curValue) : 0n,
        nextValueHash: nextValue ? this.valueToBigInt(nextValue) : 0n,
      },
      this.wasmPath,
      this.proverPath
    );
    return fullProof;
  }

  /**
   * Given a key, prepends the client secret to it and maps to
   * a bigint to be used a the preimage for the actual key derivation.
   *
   * Then, using Poseidon hash the actual key is computed.
   */
  private computeHashedKey(key: string): {
    preimage: bigint;
    computedKey: string;
  } {
    // TODO: use caching here so that these computations dont happen everytime
    // for the same key
    const preimage = this.valueToBigInt(`${this.secret}.${key}`);
    const computedKey = '0x' + poseidon1([preimage]).toString(16);
    return {preimage, computedKey};
  }

  /**
   * Convert a value into bigint using `ripemd160`.
   * - `ripemd160` outputs a hex string, which can be converted into a `bigint`.
   * - Since the result is 160 bits, it is for sure within the finite field of BN128.
   * @see https://docs.circom.io/background/background/#signals-of-a-circuit
   * @param value any kind of value
   */
  private valueToBigInt(value: unknown): bigint {
    if (value) {
      const digest = createHash('ripemd160')
        .update(JSON.stringify(value), 'utf-8')
        .digest('hex');
      return BigInt('0x' + digest);
    } else {
      return 0n;
    }
  }
}
