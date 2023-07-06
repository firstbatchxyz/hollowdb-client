export interface HollowClientOptions {
  apiKey: string;
  db: string;
  zkOptions?: {
    preimage: bigint;
    protocol: 'groth16' | 'plonk';
  };
}
