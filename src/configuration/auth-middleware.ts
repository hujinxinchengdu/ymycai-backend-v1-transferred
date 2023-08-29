import { auth } from 'express-oauth2-jwt-bearer';
import { config } from 'dotenv';

import * as fs from 'fs';

if (fs.existsSync(`.env.${process.env.NODE_ENV}`)) {
  console.log(`Using .env.${process.env.NODE_ENV} file`);
  config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  console.error(
    `The .env.${process.env.NODE_ENV} file corresponding to NODE_ENV=${process.env.NODE_ENV} is not found!`,
  );
  console.warn('Using default .env file');
  config();
}
const authMiddleware = auth({
  issuer: process.env.ISSUER,
  audience: process.env.AUDIENCE,
  secret: process.env.SECRET,
  tokenSigningAlg: process.env.TOKEN_SIGNING_ALG,
});

export { authMiddleware };
