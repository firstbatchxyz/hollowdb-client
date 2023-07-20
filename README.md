<p align="center">
  <img src="./logo.svg" alt="logo" width="142">
</p>

<p align="center">
  <h1 align="center">
    HollowDB Client
  </h1>
  <p align="center">
    <i>HollowDB client is the simplest way to use HollowDB, a decentralized & privacy-preserving key-value database.</i>
  </p>
</p>

<p align="center">
    <a href="https://opensource.org/licenses/MIT" target="_blank">
        <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg">
    </a>
    <!-- <a href="https://www.npmjs.com/package/hollowdb" target="_blank">
        <img alt="NPM" src="https://img.shields.io/npm/v/hollowdb?logo=npm&color=CB3837">
    </a> -->
    <a href="https://docs.hollowdb.xyz" target="_blank">
        <img alt="License: MIT" src="https://img.shields.io/badge/docs-hollowdb-3884FF.svg?logo=gitbook">
    </a>
    <!-- <a href="./.github/workflows/test.yml" target="_blank">
        <img alt="Workflow: Tests" src="https://github.com/firstbatchxyz/hollowdb/actions/workflows/test.yml/badge.svg?branch=master">
    </a>
    <a href="./.github/workflows/build.yml" target="_blank">
        <img alt="Workflow: Styles" src="https://github.com/firstbatchxyz/hollowdb/actions/workflows/build.yml/badge.svg?branch=master">
    </a> -->
    <a href="https://discord.gg/2wuU9ym6fq" target="_blank">
        <img alt="Discord" src="https://dcbadge.vercel.app/api/server/2wuU9ym6fq?style=flat">
    </a>
</p>

## Installation

HollowDB client is an NPM package. You can install it as:

```sh
yarn add hollowdb-client    # yarn
npm install hollowdb-client # npm
pnpm add hollowdb-client    # pnpm
```

## Usage

HollowDB client can be used both with zero-knowledge proofs and without zero-knowledge proofs.

```ts
// without zero-knowledge
client = await createHollowClient({
  apiKey: 'your-api-key',
  db: 'your-database-name',
});

// with zero-knowledge
client = await createHollowClient({
  apiKey: 'your-api-key',
  db: 'your-database-name',
  zkOptions: {
    protocol: 'groth16', // or 'plonk'
    secret: "your-secret,
  },
});
```

The secret provided here will be used to derive keys and present zero-knowledge proofs to prove that you were the one to create the key. You can create the same keys by providing the same secret at a later time.

After that, using the client is as simple as it gets:

```ts
await client.get(KEY);
await client.put(KEY, VALUE);
await client.update(KEY, VALUE);
await client.remove(KEY);
```

## Testing

To run tests:

```sh
yarn test
```

The API calls are mocked during the test, so you can run it offline.
