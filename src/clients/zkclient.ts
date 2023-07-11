import {createHash} from 'crypto';
import path from 'path';
const snarkjs = require('snarkjs');

import {Base} from '../base';
import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';

export class ZkClient extends Base {
  private readonly protocol: 'groth16' | 'plonk';
  private readonly preImage: bigint;

  private readonly wasmPath: string;
  private readonly proverPath: string;

  constructor(opt: HollowClientOptions, authToken: string) {
    super(opt, authToken);

    if (!opt.zkOptions?.protocol || !opt.zkOptions?.preimage)
      throw new Error('Protocol and preimage are required for zk');

    this.protocol = opt.zkOptions?.protocol;
    this.preImage = opt.zkOptions?.preimage;

    this.wasmPath = path.join(
      'circuits',
      `hollow-authz-${this.protocol}`,
      'hollow-authz.wasm'
    );
    this.proverPath = path.join(
      'circuits',
      `hollow-authz-${this.protocol}`,
      'prover_key.zkey'
    );
  }

  public async update(
    key: string,
    value: string | object
  ): Promise<IServerResponse<'write'>> {
    const curValue = await this.get(key);

    const fullProof = await this.generateProof(
      this.preImage,
      curValue,
      value,
      this.protocol
    );

    return await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key, value, proof: fullProof}),
    });
  }

  public async remove(key: string): Promise<IServerResponse<'write'>> {
    const curValue = await this.get(key);

    const fullProof = await this.generateProof(
      this.preImage,
      curValue,
      null,
      this.protocol
    );

    return await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key, proof: fullProof}),
    });
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
        preimage: preimage,
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
