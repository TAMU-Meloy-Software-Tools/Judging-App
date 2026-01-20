import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Cache secrets to avoid repeated calls
const secretsCache: Map<string, any> = new Map();

export async function getSecret(secretArn: string): Promise<any> {
  // Check cache first
  if (secretsCache.has(secretArn)) {
    return secretsCache.get(secretArn);
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error(`Secret ${secretArn} has no string value`);
    }

    const secret = JSON.parse(response.SecretString);
    secretsCache.set(secretArn, secret);
    return secret;
  } catch (error) {
    console.error('Error fetching secret:', error);
    throw new Error(`Failed to fetch secret: ${secretArn}`);
  }
}

export function clearSecretsCache(): void {
  secretsCache.clear();
}
