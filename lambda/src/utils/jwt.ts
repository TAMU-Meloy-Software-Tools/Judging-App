import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { getSecret } from './secrets';

let jwtSecret: string | null = null;

async function getJwtSecret(): Promise<string> {
  if (jwtSecret) return jwtSecret;

  const secretArn = process.env.JWT_SECRET_ARN;
  if (!secretArn) {
    throw new Error('JWT_SECRET_ARN environment variable not set');
  }

  const secret = await getSecret(secretArn);
  jwtSecret = typeof secret === 'string' ? secret : (secret as { jwtSecret: string }).jwtSecret;
  
  if (!jwtSecret) {
    throw new Error('JWT secret not found in Secrets Manager');
  }
  
  return jwtSecret;
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = await getJwtSecret();
  
  return jwt.sign(payload, secret, {
    expiresIn: '8h',
    issuer: 'meloy-judge-portal',
    audience: 'meloy-judge-api',
  });
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const secret = await getJwtSecret();
  
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'meloy-judge-portal',
      audience: 'meloy-judge-api',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
