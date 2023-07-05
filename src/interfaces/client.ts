export interface HollowClientOptions {
  apiKey: string;
  db: string;
  proofSystem?: 'groth16' | 'plonk';
}
