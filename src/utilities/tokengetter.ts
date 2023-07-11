export async function getToken(db: string, apiKey: string) {
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

  if (!response.ok)
    throw new Error('Server responded with a status code: ' + response.status);
  const {bearerToken} = await response.json();

  if (!bearerToken) throw new Error('Failed to get auth token');

  return bearerToken as string;
}
