import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { XMLParser } from 'fast-xml-parser';
import { userQueries } from '../../db/queries';
import { signJwt } from '../../utils/jwt';
import { successResponse, errorResponse } from '../../utils/response';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

/**
 * CAS Authentication Callback Handler
 * 
 * Validates CAS ticket with TAMU CAS server and issues JWT token
 * 
 * Flow:
 * 1. User redirects from TAMU CAS with ticket
 * 2. Lambda validates ticket with CAS server
 * 3. Extract NetID from CAS response
 * 4. Look up user in database
 * 5. Issue JWT token
 * 6. Update last_login timestamp
 */

interface CasSuccessResponse {
  'cas:serviceResponse': {
    'cas:authenticationSuccess': {
      'cas:user': string;
      'cas:attributes'?: {
        'cas:email'?: string;
        'cas:displayName'?: string;
      };
    };
  };
}

interface CasErrorResponse {
  'cas:serviceResponse': {
    'cas:authenticationFailure': {
      '@_code': string;
      '#text': string;
    };
  };
}

async function validateCasTicket(ticket: string, service: string): Promise<string> {
  const casServerUrl = 'https://cas.tamu.edu/cas/serviceValidate';
  const validationUrl = `${casServerUrl}?ticket=${encodeURIComponent(ticket)}&service=${encodeURIComponent(service)}`;

  try {
    const response = await fetch(validationUrl);
    const xmlText = await response.text();

    console.log('CAS validation response:', xmlText);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const parsed = parser.parse(xmlText);

    // Check for successful authentication
    const successResponse = parsed as CasSuccessResponse;
    if (successResponse['cas:serviceResponse']?.['cas:authenticationSuccess']) {
      const netId = successResponse['cas:serviceResponse']['cas:authenticationSuccess']['cas:user'];
      if (!netId) {
        throw new Error('No NetID in CAS response');
      }
      return netId;
    }

    // Check for authentication failure
    const errorResponse = parsed as CasErrorResponse;
    if (errorResponse['cas:serviceResponse']?.['cas:authenticationFailure']) {
      const errorCode = errorResponse['cas:serviceResponse']['cas:authenticationFailure']['@_code'];
      const errorMessage = errorResponse['cas:serviceResponse']['cas:authenticationFailure']['#text'];
      throw new Error(`CAS authentication failed: ${errorCode} - ${errorMessage}`);
    }

    throw new Error('Invalid CAS response format');
  } catch (error) {
    console.error('CAS validation error:', error);
    throw new UnauthorizedError('Failed to validate CAS ticket');
  }
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log('CAS callback event:', JSON.stringify(event, null, 2));

    // Extract ticket and service URL from query parameters
    const ticket = event.queryStringParameters?.ticket;
    if (!ticket) {
      throw new UnauthorizedError('Missing CAS ticket');
    }

    const service = process.env.CAS_SERVICE_URL;
    if (!service) {
      throw new Error('CAS_SERVICE_URL not configured');
    }

    // Validate ticket with TAMU CAS server
    console.log('Validating CAS ticket...');
    const netId = await validateCasTicket(ticket, service);
    console.log('CAS validation successful, NetID:', netId);

    // Look up user in database
    const user = await userQueries.findByNetId(netId);
    if (!user) {
      throw new ForbiddenError('User not found. Please contact administrator.');
    }

    if (!user.is_active) {
      throw new ForbiddenError('User account is inactive');
    }

    // Update last login timestamp
    await userQueries.updateLastLogin(user.id);

    // Generate JWT token
    const token = await signJwt({
      userId: user.id,
      netId: user.netid || netId,
      email: user.email,
      role: user.role,
    });

    console.log('JWT token generated for user:', user.id);

    // Return token and user info
    return successResponse({
      token,
      user: {
        id: user.id,
        netId: user.netid || netId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    console.error('CAS callback error:', error);

    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return errorResponse(error.message, error.statusCode);
    }

    return errorResponse('Authentication failed', 500);
  }
}
