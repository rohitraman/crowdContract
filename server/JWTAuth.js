const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')

dotenv.config();

// require('crypto').randomBytes(64).toString('hex')
const secret = process.env.JWTSECRET;
