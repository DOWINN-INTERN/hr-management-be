import { IJwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';

/**
 * Service responsible for JWT (JSON Web Token) operations.
 * Provides methods for creating, verifying, and decoding JWT tokens,
 * as well as managing JWT payloads.
 */
/**
 * @class JwtService
 * @injectable
 */

/**
 * @constructor
 * @param {NestJwtService} jwtService - The NestJS JWT service instance
 */

/**
 * Creates a JWT token from the provided payload
 * @method createToken
 * @param {IJwtPayload} payload - The payload to be encoded in the JWT
 * @returns {Promise<string>} A Promise that resolves to the JWT string
 */

/**
 * Verifies and decodes a JWT token
 * @method verifyToken
 * @param {string} token - The JWT token to verify
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded payload
 * @throws {Error} If the token is invalid or expired
 */

/**
 * Decodes a JWT token without verifying its signature
 * @method decodeToken
 * @param {string} token - The JWT token to decode
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded payload
 */

/**
 * Creates a standard JWT payload with common claims
 * @method createPayload
 * @param {string} userId - The user's unique identifier
 * @param {string} [email] - Optional email address
 * @param {string[]} [roles] - Optional array of user roles
 * @returns {IJwtPayload} The formatted JWT payload
 */

/**
 * Validates the structure of a JWT payload
 * @method validatePayload
 * @param {any} payload - The payload to validate
 * @returns {boolean} True if the payload matches the IJwtPayload structure
 */
/**
 * Service responsible for handling JSON Web Token (JWT) operations.
 * Provides functionality for creating, verifying, and decoding JWT tokens.
 * 
 * @class
 */

/**
 * @constructor
 * @param {NestJwtService} jwtService - The NestJS JWT service instance
 * @param {ConfigService} configService - The configuration service for accessing environment variables
 */

/**
 * Creates a JWT token from the provided payload
 * @param {IJwtPayload} payload - The payload to be encoded in the token
 * @returns {Promise<string>} A Promise that resolves to the signed JWT token
 */

/**
 * Creates a refresh token from the provided payload with configurable expiration
 * @param {IJwtPayload} payload - The payload to be encoded in the refresh token
 * @returns {Promise<string>} A Promise that resolves to the signed refresh token
 */

/**
 * Verifies and decodes a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded and verified payload
 * @throws {Error} If the token is invalid or expired
 */

/**
 * Decodes a JWT token without verification
 * @param {string} token - The JWT token to decode
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded payload
 */

/**
 * Creates a standard JWT payload with user information and expiration
 * @param {string} userId - The unique identifier of the user
 * @param {string} [email] - Optional email of the user
 * @param {string[]} [roles] - Optional array of user roles
 * @returns {IJwtPayload} The created JWT payload object
 */

/**
 * Validates the structure of a JWT payload
 * @param {any} payload - The payload to validate
 * @returns {boolean} True if the payload matches the expected structure, false otherwise
 */
@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService,
    ) {}

  /**
   * Create a JWT token from payload
   */
  async createToken(payload: IJwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Create a refresh token from payload
   */
  async createRefreshToken(): Promise<string> {
    // const refreshTokenExpirationMinutes: number = this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION_MINUTES');
    // return this.jwtService.sign(payload, { expiresIn: `${refreshTokenExpirationMinutes}m` });
    return uuidv4();
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<IJwtPayload> {
    return this.jwtService.verify<IJwtPayload>(token);
  }

  /**
   * Decode a JWT token without verifying
   */
  async decodeToken(token: string): Promise<IJwtPayload> {
    return this.jwtService.decode(token) as IJwtPayload;
  }

  /**
   * Create a standard JWT payload
   */
  createPayload(user: User, refreshToken?: string): IJwtPayload {
    const now = Math.floor(Date.now() / 1000);
    const mappedRoles = user.employee?.roles ? user.employee?.roles.map(role => ({
      name: role.name,
      scope: role.scope
    })) : [];

    return {
      sub: user.id,
      iat: now,
      refreshToken,
      email: user.email,
      roles: mappedRoles ?? [],
      employeeId: user.employee?.id
    };
  }

  /**
   * Validate payload structure
   */
  validatePayload(payload: any): payload is IJwtPayload {
    return (
      typeof payload === 'object' &&
      typeof payload.sub === 'string' &&
      (!payload.email || typeof payload.email === 'string') &&
      (!payload.roles || Array.isArray(payload.roles))
    );
  }
}