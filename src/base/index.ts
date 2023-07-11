import type {IHollowClient} from '../interfaces/client.interface';
import type {IFetchHandler} from '../interfaces/fetch.interface';
import type {IServerResponse} from '../interfaces/response.interface';
import type {HollowClientOptions} from '../interfaces/options.interface';

export abstract class Base implements IHollowClient {
  protected readonly dbUrl = 'http://localhost:3000'; //TODO: change to the real url
  protected readonly apiKey: string;
  protected authToken: string;

  constructor(opt: HollowClientOptions, authToken: string) {
    this.apiKey = opt.apiKey;
    this.authToken = authToken;
  }

  public async get(key: string): Promise<IServerResponse<'get'>> {
    return await this.fetchHandler({
      op: 'get',
      key,
    });
  }

  public async put(
    key: string,
    value: string | object
  ): Promise<IServerResponse<'write'>> {
    return await this.fetchHandler({
      op: 'put',
      body: JSON.stringify({key, value}),
    });
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
        throw new Error('will get new token'); //TODO: try to get new token
      }
    }

    throw new Error(json.message);
  }

  public abstract update(
    key: string,
    value: string | object
  ): Promise<IServerResponse<'write'>>;
  public abstract remove(
    key: string,
    proof?: object
  ): Promise<IServerResponse<'write'>>;
}
