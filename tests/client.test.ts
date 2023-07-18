import {describe, expect, test, beforeAll} from '@jest/globals';
import {randomUUID} from 'crypto';

import {HollowClient} from '../lib/index';
import {payload} from './constants';

import type {IHollowClient, HollowClientOptions} from '../lib/index';

describe('client test', () => {
  let client: IHollowClient;
  let key: string;

  beforeAll(async () => {
    const opt: HollowClientOptions = {
      apiKey: '032c17ddb874904f112057bda9082c28',
      db: 'test',
    };

    client = await HollowClient.createAsync(opt);
    
    key = randomUUID();
  });

  test('put', async () => {
    await expect(client.put(key, payload)).resolves.not.toThrowError();
  });

  test('get', async () => {
    const result = await client.get(key);
    expect(result).toMatchObject(payload);
  });
});
