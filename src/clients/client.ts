import {Base} from '../base';
import type {IServerWriteResponse} from '../interfaces/response.interface';

export class Client extends Base {
  constructor(apiKey: string, authToken: string) {
    super(apiKey, authToken);
  }

  public async update(key: string, value: string | object): Promise<void> {
    const response = await fetch(`${this.dbUrl}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({key, value}),
    });

    if (!response.ok) {
      const putResponse: IServerWriteResponse = await response.json();
      throw new Error('Update Error: ' + putResponse.message);
    }
  }

  public async remove(key: string, proof?: object | undefined): Promise<void> {
    const response = await fetch(`${this.dbUrl}/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({key}),
    });

    if (!response.ok) {
      const putResponse: IServerWriteResponse = await response.json();
      throw new Error('Update Error: ' + putResponse.message);
    }
  }
}
