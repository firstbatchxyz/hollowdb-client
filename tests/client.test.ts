import {describe, expect, test, beforeAll} from '@jest/globals';
import {randomUUID} from 'crypto';

import {createHollowClient} from '../lib/index';
import {payload} from './constants';

import type {HollowClient, HollowClientOptions} from '../lib/index';

describe('client test', () => {
  let client: HollowClient;
  let key: string;

  beforeAll(async () => {
    const opt: HollowClientOptions = {
      apiKey: '032c17ddb874904f112057bda9082c28',
      db: 'test',
    };

    client = await createHollowClient(opt);
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
