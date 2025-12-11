import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
};

export default { generateAccessToken, generateRefreshToken, verifyRefreshToken };
