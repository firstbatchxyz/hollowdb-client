import {getToken} from '../utilities/tokengetter';

import type {IHollowClient} from '../interfaces/client.interface';
import type {IFetchHandler} from '../interfaces/fetch.interface';
import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';

export abstract class Base implements IHollowClient {
  // protected readonly dbUrl =
  //   'http://k8s-default-ingressh-1b5e0101ad-238028031.us-east-1.elb.amazonaws.com'; //TODO: change to the real url
  protected readonly dbUrl = 'http://localhost:3000'; //TODO: change to the real url
  protected readonly apiKey: string;
  protected authToken: string;
  protected db: string;

  constructor(opt: HollowClientOptions, authToken: string) {
    this.apiKey = opt.apiKey;
    this.authToken = authToken;
    this.db = opt.db;
  }

  protected async fetchHandler(
    opt: IFetchHandler
  ): Promise<IServerResponse<'get' | 'write'>> {
    const url =
      opt.op === 'get'
        ? `${this.dbUrl}/${opt.op}/${opt.key}`
        : `${this.dbUrl}/${opt.op}`;

    const response = await fetch(url, {
      method: opt.op === 'get' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${this.authToken}`,
      },
      ...(opt.body && {
        body: opt.body,
      }),
    });

    const json: IServerResponse<'get' | 'write'> = await response.json();

    if (response.status === 200) {
      if (json.newBearer) this.authToken = json.newBearer;
      return json;
    } else {
      if (json.message === 'token expired') {
        this.authToken = await getToken(this.db, this.apiKey);
      }
    }

    throw new Error(json.message);
  }

  public abstract get(key: string): Promise<IServerResponse<'get'>>;

  public abstract put(
    key: string,
    value: string | object
  ): Promise<IServerResponse<'write'>>;

  public abstract update(
    key: string,
    value: string | object
  ): Promise<IServerResponse<'write'>>;

  public abstract remove(
    key: string,
    proof?: object
  ): Promise<IServerResponse<'write'>>;
}
