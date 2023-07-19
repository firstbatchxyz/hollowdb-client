const BASE_URL = 'http://localhost:3000';

/** A mocked fetch call, intercepting client fetches during the test. */
export const mockFetch = jest.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    console.log('hi im called:', {input});

    // mock auth call
    if (url.startsWith('https://auth.firstbatch.xyz/hollow/create_bearer')) {
      return {
        ok: true,
        json: async () => ({bearerToken: 'bearer-test'}),
      } as Response;
    }

    // mock put call, no refresh
    else if (url.startsWith(`${BASE_URL}/put`)) {
      return {
        ok: true,
        status: 200,
        json: async () => ({message: ''}),
      } as Response;
    }

    // mock update call, no refresh
    else if (url.startsWith(`${BASE_URL}/update`)) {
      return {
        ok: true,
        status: 200,
        json: async () => ({message: ''}),
      } as Response;
    }

    // mock update call, no refresh
    else if (url.startsWith(`${BASE_URL}/remove`)) {
      return {
        ok: true,
        status: 200,
        json: async () => ({message: ''}),
      } as Response;
    }

    // unexpected & unmockable stuff
    else
      return {
        ok: false,
        json: async () => {
          return new Error('unexpected mock fetch');
        },
      } as Response;
  }
);
