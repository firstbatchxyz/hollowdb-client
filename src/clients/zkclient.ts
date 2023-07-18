import {createHash} from 'crypto';
import path from 'path';
import {HollowDBError} from '../utilities/errors';

import {poseidon1} from 'poseidon-lite';
const snarkjs = require('snarkjs');

import {Base} from './base';
import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';

export class ZkClient extends Base {
  private readonly protocol: 'groth16' | 'plonk';
  private readonly secret: string;

  private readonly wasmPath: string;
  private readonly proverPath: string;

  constructor(opt: HollowClientOptions, authToken: string) {
    super(opt, authToken);

    if (!opt.zkOptions?.protocol || !opt.zkOptions?.secret)
      throw new Error('Protocol and preimage are required for zk');

    this.protocol = opt.zkOptions?.protocol;
    this.secret = opt.zkOptions?.secret;

    this.wasmPath = path.join(
      './node_modules/hollowdb-client/circuits',
      `hollow-authz-${this.protocol}`,
      'hollow-authz.wasm'
    );
    this.proverPath = path.join(
      './node_modules/hollowdb-client/circuits',
      `hollow-authz-${this.protocol}`,
      'prover_key.zkey'
    );
  }

  public async get(key: string): Promise<object | string> {
    const preImage = this.computePreimage(key);
    const computedKey = this.computeKey(preImage);

    const response: IServerResponse<'get'> = await this.fetchHandler({
      op: 'get',
      key: computedKey,
    });

    if (response.data) return response.data.result;

    throw new HollowDBError({
      message: 'HollowDB Get Error: Unknown error',
    });
  }

  public async put(key: string, value: string | object): Promise<void> {
    const preImage = this.computePreimage(key);
    const computedKey = this.computeKey(preImage);

    await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key: computedKey, value}),
    });
  }

  public async update(key: string, value: string | object): Promise<void> {
    const preImage = this.computePreimage(key);
    const computedKey = this.computeKey(preImage);

    const getResponse: IServerResponse<'get'> = await this.fetchHandler({
      op: 'get',
      key: computedKey,
    });

    if (!getResponse.data)
      throw new HollowDBError({
        message:
          'HollowDB Update Error: Server Response was OK but data was empty',
      });

    const curValue = getResponse.data.result;

    const fullProof = await this.generateProof(
      preImage,
      curValue,
      value,
      this.protocol
    );

    await this.fetchHandler({
      op: 'update',
      body: JSON.stringify({key: computedKey, value, proof: fullProof.proof}),
    });
  }

  public async remove(key: string): Promise<void> {
    const preImage = this.computePreimage(key);
    const computedKey = this.computeKey(preImage);

    const getResponse: IServerResponse<'get'> = await this.fetchHandler({
      op: 'get',
      key: computedKey,
    });

    if (!getResponse.data)
      throw new HollowDBError({
        message:
          'HollowDB Remove Error: Server Response was OK but data was empty',
      });

    const curValue = getResponse.data.result;

    const fullProof = await this.generateProof(
      preImage,
      curValue,
      null,
      this.protocol
    );

    await this.fetchHandler({
      op: 'remove',
      body: JSON.stringify({key: computedKey, proof: fullProof.proof}),
    });
  }

  private computePreimage(key: string) {
    return this.valueToBigInt(`${this.secret}.${key}`);
  }

  /**
   * Compute the key that only you can know the preimage of.
   * @param preimage your secret, the preimage of the key
   * @returns Poseidon hash of your secret as an hexadecimal string
   */
  private computeKey(preimage: bigint): string {
    return '0x' + poseidon1([preimage]).toString(16);
  }

  private async generateProof(
    preimage: bigint,
    curValue: unknown | null,
    nextValue: unknown | null,
    protocol: 'groth16' | 'plonk'
  ): Promise<{
    proof: object;
    publicSignals: [
      curValueHashOut: string,
      nextValueHashOut: string,
      key: string
    ];
  }> {
    const fullProof = await snarkjs[protocol].fullProve(
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
