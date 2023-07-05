import {createHash} from 'crypto';
import path from 'path';
const snarkjs = require('snarkjs');

import type {HollowClientOptions} from './interfaces/client';

class HollowClient {
  private readonly authUrl = 'auth.hollowdb.io'; //TODO: change to the real url
  private readonly dbUrl = 'http://localhost:3000'; //TODO: change to the real url

  private readonly db: string;
  private readonly protocol: 'groth16' | 'plonk' | undefined;

  private readonly wasmPath: string | undefined;
  private readonly proverPath: string | undefined;

  private readonly apiKey: string;
  private static authToken: string;

  private constructor(opt: HollowClientOptions) {
    this.apiKey = opt.apiKey;
    this.db = opt.db;
    this.protocol = opt.proofSystem || undefined;

    if (this.protocol) {
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
  }

  public static async CreateAsync(
    opt: HollowClientOptions
  ): Promise<HollowClient> {
    const client = new HollowClient(opt);

    HollowClient.authToken = await client.getAuthToken();

    return client;
  }

  public async get(key: string) {
    const response = await fetch(`${this.dbUrl}/get/${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${HollowClient.authToken}`,
      },
    });

    return await response.json();
  }

  public async put(key: string, value: string | object) {
    const response = await fetch(`${this.dbUrl}/put`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${HollowClient.authToken}`,
      },
      body: JSON.stringify({key, value}),
    });

    return await response.json();
  }

  public async update(key: string, value: string | object, proof?: object) {
    const response = await fetch(`${this.dbUrl}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${HollowClient.authToken}`,
      },
      body: JSON.stringify({key, value, proof}),
    });

    return await response.json();
  }

  public async remove(key: string, proof?: object) {
    const response = await fetch(`${this.dbUrl}/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${HollowClient.authToken}`,
      },
      body: JSON.stringify({key, proof}),
    });

    return await response.json();
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

    return 'temp-token'; //Change this to the actual token for testing
  }

  private async generateProof(
    preimage: bigint,
    curValue: unknown | null,
    nextValue: unknown | null,
    proofSystem: 'groth16' | 'plonk'
  ): Promise<{
    proof: object;
    publicSignals: [
      curValueHashOut: string,
      nextValueHashOut: string,
      key: string
    ];
  }> {
    const fullProof = await snarkjs[proofSystem].fullProve(
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

//TODO: remove this
function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export {HollowClient, HollowClientOptions};
