import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn,
  };
  return jwt.sign(payload, jwtConfig.secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refreshExpiresIn,
  };
  return jwt.sign(payload, jwtConfig.refreshSecret, options);
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
};

export default { generateAccessToken, generateRefreshToken, verifyRefreshToken };
