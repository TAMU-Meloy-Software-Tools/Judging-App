import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Amplify SSR doesn't always expose env vars to process.env
// So we need to handle undefined values
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const auth0 = new Auth0Client({
  domain: getEnvVar('AUTH0_DOMAIN'),
  clientId: getEnvVar('AUTH0_CLIENT_ID'),
  clientSecret: getEnvVar('AUTH0_CLIENT_SECRET'),
  appBaseUrl: getEnvVar('AUTH0_BASE_URL'),
  secret: getEnvVar('AUTH0_SECRET'),
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
  },
});
