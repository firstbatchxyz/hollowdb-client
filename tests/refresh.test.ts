import {randomBytes} from 'crypto';
import {createHollowClient, type HollowClient} from '../src';
import {mockFetchGetRefresh} from './mocks';

const KEY = 'my lovely key';

describe('token refresh', () => {
  let client: HollowClient;

  beforeAll(async () => {
    global.fetch = mockFetchGetRefresh; // mock fetch

    client = await createHollowClient({
      apiKey: randomBytes(32).toString('hex'),
      db: 'testing',
    });
  });

  it('should get with refreshed token', async () => {
    await client.get(KEY);

    // should not throw error if token is refreshed correctly
    await expect(client.get(KEY)).resolves.not.toThrowError();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });
});
