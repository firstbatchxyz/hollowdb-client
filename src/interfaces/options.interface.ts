export interface HollowClientOptions {
  apiKey: string;
  db: string;
  zkOptions?: {
    secret: string;
    protocol: 'groth16' | 'plonk';
  };
}
