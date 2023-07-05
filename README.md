# HOLLOWDB LIGHT CLIENT

HollowDB Client intended for HDBaaS usage

## Usage

### Setup

```js
const client = await HollowClient.CreateAsync({
  apiKey: '032c17ddb874904f112057bda9082c28',
  db: 'test',
  proofSystem: 'groth16',
});

const key = 'foo';
const payload = 'bar';
await client.put(key, payload);
```
