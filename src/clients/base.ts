import {getToken} from '../utilities/getToken';

import type {IHollowClient} from '../interfaces/client.interface';
import type {IFetchHandler} from '../interfaces/fetch.interface';
import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';
import {HollowDBError} from '../utilities/errors';

/** Base API URL */
const BASE_URL = 'http://localhost:3000'; //TODO: change to the real url

export abstract class Base implements IHollowClient {
  protected readonly apiKey: string;
  protected authToken: string;
  protected db: string;

  // TODO: any reason why HollowClientOptions does not have `authToken`?
  constructor(opt: HollowClientOptions, authToken: string) {
    this.apiKey = opt.apiKey;
    this.authToken = authToken;
    this.db = opt.db;
  }

  protected async fetchHandler(opt: IFetchHandler): Promise<IServerResponse> {
    const url =
      opt.op === 'get'
        ? `${BASE_URL}/${opt.op}/${opt.key}`
        : `${BASE_URL}/${opt.op}`;

    const headers: RequestInit['headers'] = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      authorization: `Bearer ${this.authToken}`,
    };

    const response = await fetch(
      url,
      opt.op === 'get'
        ? {
            headers,
            method: 'GET',
          }
        : {
            headers,
            method: 'POST',
            body: opt.body,
          }
    );

    const json: IServerResponse = await response.json();
    if (response.status === 200) {
      // new bearer has been created due to expiration of previous
      if (json.newBearer !== undefined) {
        this.authToken = json.newBearer;
      }
      return json;
    } else {
      // TODO: this does not mean token expired, it may be any other error
      // such as internal server error, invalid path or whatever
      if (json.message === 'token expired') {
        this.authToken = await getToken(this.db, this.apiKey);
        return json;
      }
    }

    throw new HollowDBError({
      message: `${opt.op}: Status: ${response.status} Error: ${json.message}`,
    });
  }

  public abstract get(key: string): Promise<object | string>;
  public abstract put(key: string, value: string | object): Promise<void>;
  public abstract update(key: string, value: string | object): Promise<void>;
  public abstract remove(key: string): Promise<void>;
}
