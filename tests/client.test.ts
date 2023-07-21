import {randomBytes} from 'crypto';
import {createHollowClient, type HollowClient} from '../src';
import {mockFetchDB} from './mocks';

const KEY = 'my lovely testing key';
type ValueType = {
  test: number;
  foo: string;
};

// we can add plonk here too, but note that it has HUGE prover time
([null, 'groth16'] as const).map(protocol =>
  describe(`client ${
    protocol ? `(protocol: ${protocol})` : '(not zk)'
  }`, () => {
    let client: HollowClient<ValueType>;
    const values: ValueType[] = Array.from({length: 10}, () => ({
      test: Math.random() * 99,
      foo: randomBytes(4).toString('hex'),
    }));

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

    it('should put value', async () => {
      expect(await client.get(KEY)).toEqual(null);
      await client.put(KEY, values[0]);
      expect(await client.get(KEY)).toEqual(values[0]);
    });

    it('should update values', async () => {
      for (let i = 1; i < values.length; i++) {
        expect(await client.get(KEY)).toEqual(values[i - 1]);
        await client.update(KEY, values[i]);
        expect(await client.get(KEY)).toEqual(values[i]);
      }
    });

    it('should remove value', async () => {
      expect(await client.get(KEY)).toEqual(values[values.length - 1]);
      await client.remove(KEY);
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
