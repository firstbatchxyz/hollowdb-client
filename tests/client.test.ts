import {randomBytes} from 'crypto';
import {createHollowClient, type HollowClient} from '../src';
import {mockFetchDB} from './mocks';

const KEY = 'my lovely key';
const VALUE = {
  foo: 'bar',
};
const NEXT_VALUE = {
  foo: '123',
};

([null, 'groth16', 'plonk'] as const).map(protocol =>
  describe(`client ${
    protocol ? `(protocol: ${protocol})` : '(not zk)'
  }`, () => {
    let client: HollowClient<typeof VALUE>;

    beforeAll(async () => {
      global.fetch = mockFetchDB;

      client = await createHollowClient({
        apiKey: randomBytes(32).toString('hex'),
        db: 'testing',
        zkOptions: protocol
          ? {
              protocol,
              secret: randomBytes(16).toString('hex'),
            }
          : undefined,
      });
    });

    it('should put & get a value', async () => {
      expect(await client.get(KEY)).toEqual(null);
      await expect(client.put(KEY, VALUE)).resolves.not.toThrowError();
      expect(await client.get(KEY)).toEqual(VALUE);
    });

    it('should update a value', async () => {
      expect(await client.get(KEY)).toEqual(VALUE);
      await expect(client.update(KEY, NEXT_VALUE)).resolves.not.toThrowError();
      expect(await client.get(KEY)).toEqual(NEXT_VALUE);
    });

    it('should remove a value', async () => {
      expect(await client.get(KEY)).toEqual(NEXT_VALUE);
      await expect(client.remove(KEY)).resolves.not.toThrowError();
      expect(await client.get(KEY)).toEqual(null);
    });

    afterAll(async () => {
      jest.clearAllMocks();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      // SnarkJS may attach curve_bn128 to global, but does not terminate it.
      if (global.curve_bn128) await global.curve_bn128.terminate();
    });
  })
);
