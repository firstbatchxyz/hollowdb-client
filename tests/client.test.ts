import {randomUUID} from 'crypto';
import {createHollowClient, type HollowClient} from '../src';
import {mockFetch} from './mocks';

describe('client test', () => {
  let client: HollowClient;

  const KEY = 'key123';
  const VALUE = {
    foo: 'bar',
  };

  beforeAll(async () => {
    // TODO; where should this be placed?
    global.fetch = mockFetch;
    client = await createHollowClient({
      apiKey: '032c17ddb874904f112057bda9082c28',
      db: 'test',
    });
  });

  it('should put & get a value', async () => {
    await expect(client.put(KEY, VALUE)).resolves.not.toThrowError();
  });

  // test('get', async () => {
  //   const result = await client.get(key);
  //   expect(result).toMatchObject(payload);
  // });
});
