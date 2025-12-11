import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('Missing JWT secrets in environment variables');
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
};

export default jwtConfig;
