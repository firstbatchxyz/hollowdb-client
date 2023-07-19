import path from 'path';
import {createHash} from 'crypto';
import {poseidon1} from 'poseidon-lite';
const snarkjs = require('snarkjs');

import {Base} from './base';
import type {HollowClientOptions} from './interfaces';

export class ZkClient<T> extends Base<T> {
  private readonly protocol: 'groth16' | 'plonk';
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
    return await this.read(computedKey);
  }

  public async put(key: string, value: T): Promise<void> {
    const {computedKey} = this.computeHashedKey(key);
    await this.write('put', JSON.stringify({key: computedKey, value}));
  }

  public async update(key: string, value: T): Promise<void> {
    const {preimage, computedKey} = this.computeHashedKey(key);

    const oldValue = await this.read(computedKey);
    const {proof} = await this.generateProof(preimage, oldValue, value);

    await this.write(
      'update',
      JSON.stringify({key: computedKey, value, proof})
    );
  }

  public async remove(key: string): Promise<void> {
    const {preimage, computedKey} = this.computeHashedKey(key);

    const oldValue = await this.read(computedKey);
    const {proof} = await this.generateProof(preimage, oldValue, null);

    await this.write('remove', JSON.stringify({key: computedKey, proof}));
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
    return snarkjs[this.protocol].fullProve(
      {
        preimage,
        curValueHash: curValue ? this.valueToBigInt(curValue) : 0n,
        nextValueHash: nextValue ? this.valueToBigInt(nextValue) : 0n,
      },
      this.wasmPath,
      this.proverPath
    );
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
