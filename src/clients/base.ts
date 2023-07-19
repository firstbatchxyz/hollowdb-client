import {getToken} from '../utilities';

import type {
  HollowClientOptions,
  ServerResponse,
  HollowClient,
} from '../interfaces';
import {HollowDBError} from '../errors';

const BASE_URL =
  process.env.NODE_ENV === 'test'
    ? 'http://localhost:3000' // Jest makes `NODE_ENV=test` by default
    : 'http://localhost:9999'; // TODO: change to the real url

export abstract class Base<T> implements HollowClient<T> {
  protected readonly apiKey: string;
  protected authToken: string;
  protected db: string;

  // auth token is retrieved by the client code, so it is not provided in opt
  constructor(opt: HollowClientOptions, authToken: string) {
    this.apiKey = opt.apiKey;
    this.authToken = authToken;
    this.db = opt.db;
  }

  protected async fetchHandler<T>(
    opt:
      | {
          op: 'get';
          key: string;
        }
      | {
          op: 'put' | 'update' | 'remove';
          body: BodyInit;
        }
  ): Promise<ServerResponse<T>> {
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

    const json: ServerResponse<T> = await response.json();
    if (response.status === 200) {
      // new bearer has been created due to expiration of previous
      if (json.newBearer !== undefined) {
        this.authToken = json.newBearer;
      }
      return json;
    } else if (json.message === 'token expired') {
      // TODO: potential security issue? the server response json.message may be fabricated perhaps
      this.authToken = await getToken(this.db, this.apiKey);
      return json;
    }

    throw new HollowDBError({
      message: `${opt.op}: Status: ${response.status} Error: ${json.message}`,
    });
  }

  public abstract get(key: string): Promise<T>;
  public abstract put(key: string, value: T): Promise<void>;
  public abstract update(key: string, value: T): Promise<void>;
  public abstract remove(key: string): Promise<void>;
}
