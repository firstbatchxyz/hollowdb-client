# HOLLOWDB LIGHT CLIENT

HollowDB Client intended for HDBaaS usage

## Usage

### Setup

```js
const client = await HollowClient.CreateAsync({
  apiKey: '<YOUR-API-KEY>',
  db: '<YOUR-DB-NAME>',
});

const key = 'foo';
const payload = 'bar';
await client.put(key, payload);
const result = await client.get(key);
```
