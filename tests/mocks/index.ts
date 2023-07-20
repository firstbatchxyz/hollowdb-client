import {randomBytes} from 'crypto';
import {valueToBigInt, verifyProof} from '../utilities';

const BASE_URL = 'http://localhost:3000';

const db: Record<string, unknown> = {};

/** A mocked fetch call, acting like the DB backend. */
export const mockFetchDB = jest.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();

    // mock auth call
    if (url.startsWith('https://auth.firstbatch.xyz/hollow/create_bearer')) {
      return {
        ok: true,
        json: async () => ({bearerToken: 'bearer-test'}),
      } as Response;
    }

    // mock write call, no refresh
    else if (
      url === `${BASE_URL}/put` ||
      url === `${BASE_URL}/update` ||
      url === `${BASE_URL}/remove`
    ) {
      if (init === undefined) {
        throw new Error('expected init');
      }

      const op = url.slice(`${BASE_URL}/`.length);
      const body = JSON.parse(init.body as string);

      switch (op) {
        case 'put':
          db[body.key] = body.value;
          break;
        case 'update':
          if (body.proof) {
            verifyProof(body.proof, [
              valueToBigInt(db[body.key]),
              valueToBigInt(body.value),
              BigInt(body.key),
            ]);
          }

          db[body.key] = body.value;
          break;
        case 'remove':
          if (body.proof) {
            verifyProof(body.proof, [
              valueToBigInt(db[body.key]),
              BigInt(0),
              BigInt(body.key),
            ]);
          }

          delete db[body.key];
          break;
        default:
          throw new Error('unexpected op: ' + op);
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({message: ''}),
      } as Response;
    }

    // mock read call, no refresh
    else if (url.startsWith(`${BASE_URL}/get/`)) {
      const key = url.slice(`${BASE_URL}/get/`.length);
      const val = db[key];
      return {
        ok: true,
        status: 200,
        json: async () => ({message: '', data: {result: val ? val : null}}),
      } as Response;
    }

    throw new Error('couldnt mock');
  }
);

/** A mocked fetch call, just answers get and  */
const NEW_AUTH_TOKEN = randomBytes(32).toString('hex');
let refreshed = false;
export const mockFetchGetRefresh = jest.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    console.log(init?.headers);
    console.log(url);

    // mock auth call
    if (url.startsWith('https://auth.firstbatch.xyz/hollow/create_bearer')) {
      return {
        ok: true,
        json: async () => ({bearerToken: 'bearer-test'}),
      } as Response;
    }

    // mock get call with refresh
    else if (url.startsWith(`${BASE_URL}/get/`)) {
      refreshed = true;
      return {
        ok: true,
        json: async () => ({
          bearerToken: 'bearer-test',
          message: '',
          data: {result: 'value'},
        }),
      } as Response;
    }

    throw new Error('couldnt mock');
  }
);
