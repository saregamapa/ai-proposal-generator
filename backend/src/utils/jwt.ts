import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload { userId: string; email: string; }

export const generateAccessToken = (payload: TokenPayload): string => jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn, issuer: 'ai-proposal-generator' });
export const generateRefreshToken = (payload: TokenPayload): string => jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn, issuer: 'ai-proposal-generator' });
export const verifyRefreshToken = (token: string): TokenPayload => jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
export const generateTokenPair = (payload: TokenPayload) => ({ accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) });
