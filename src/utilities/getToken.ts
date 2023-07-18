import type {IAuthResponse} from '../interfaces/response.interface';
import {AuthError} from './errors';

/**
 *
 * @param db database name
 * @param apiKey api key
 * @returns bearer token to be used in header as `authorization: "Bearer ${token}"`
 */
export async function getToken(db: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://auth.firstbatch.xyz/hollow/create_bearer?db=${db}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    }
  );

  const authResponse: IAuthResponse = await response.json();
  if (!response.ok) {
    if (authResponse.message) {
      throw new AuthError({
        message: authResponse.message,
        helper: 'Check your API key and database name',
      });
    }

    throw new AuthError({
      message: 'Failed to get auth token: Unknown error',
      helper:
        'Auth service may be down, you can check the status of HollowDB services at https://status.hollowdb.xyz',
    });
  }

  if (!authResponse.bearerToken) {
    throw new AuthError({
      message:
        'Failed to get auth token: Fatal error, server bearer response empty',
    });
  }

  return authResponse.bearerToken;
}
