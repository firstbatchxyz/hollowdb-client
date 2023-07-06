import type {IHollowClient} from '../interfaces/client.interface';
import type {
  IServerWriteResponse,
  IServerGetResponse,
} from '../interfaces/response.interface';

export abstract class Base implements IHollowClient {
  protected readonly dbUrl = 'http://localhost:3000'; //TODO: change to the real url
  protected readonly hollowHeader: HeadersInit;

  constructor(apiKey: string, authToken: string) {
    this.hollowHeader = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      authorization: `Bearer ${authToken}`,
    };
  }

  public async get(key: string): Promise<object | string> {
    const response = await fetch(`${this.dbUrl}/get/${key}`, {
      method: 'GET',
      headers: this.hollowHeader,
    });

    const getResponse: IServerGetResponse = await response.json();

    if (!response.ok) {
      throw new Error('Get Error: ' + getResponse.message);
    }

    return getResponse.data.result;
  }

  public async put(key: string, value: string | object): Promise<void> {
    const response = await fetch(`${this.dbUrl}/put`, {
      method: 'POST',
      headers: this.hollowHeader,
      body: JSON.stringify({key, value}),
    });

    if (!response.ok) {
      const putResponse: IServerWriteResponse = await response.json();
      throw new Error('Put Error: ' + putResponse.message);
    }
  }

  public abstract update(key: string, value: string | object): Promise<void>;

  public abstract remove(key: string, proof?: object): Promise<void>;
}
