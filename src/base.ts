import {getToken} from './utilities';

import type {HollowClientOptions, HollowClient} from './interfaces';
import {HollowDBError} from './errors';

// TODO: change to the real url
const BASE_URL = 'http://localhost:3000';

export abstract class Base<T> implements HollowClient<T> {
  protected readonly apiKey: string;
  protected readonly db: string;
  protected authToken: string;

  // auth token is retrieved by the client code, so it is not provided within `opt`
  constructor(opt: HollowClientOptions, authToken: string) {
    this.apiKey = opt.apiKey;
    this.authToken = authToken;
    this.db = opt.db;
  }

  protected async read(key: string) {
    const encodedKey = encodeURIComponent(key);
    const response = await this.fetch<'read'>(
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

  // TODO: use actual type, not body init
  protected async write(op: 'put' | 'update' | 'remove', body: BodyInit) {
    return this.fetch<'write'>(`${BASE_URL}/${op}`, 'POST', body);
  }

  private async fetch<M extends 'read' | 'write'>(
    url: string,
    method: 'GET' | 'POST',
    body?: BodyInit
  ) {
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

    const json = (await response.json()) as {
      message: string;
      data?: M extends 'read' ? {result: T} : undefined;
      newBearer?: string;
    };
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
      message: `${url}: Status: ${response.status} Error: ${json.message}`,
    });
  }

  public abstract get(key: string): Promise<T>;
  public abstract put(key: string, value: T): Promise<void>;
  public abstract update(key: string, value: T): Promise<void>;
  public abstract remove(key: string): Promise<void>;
}
