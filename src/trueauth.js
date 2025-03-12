require('dotenv').config(); //carga variables desde .env

const jwt = require('jsonwebtoken');
const axios = require('axios');

const TOKEN_TYPE = "JWT";
const ALGORITHM = "HS256";

class TrueAuth {
  constructor() {
    this.sharedSecret_ =
      process.env.TRUE_SHARED_SECRET || process.env.SHARED_SECRET;
    if (!this.sharedSecret_) {
      throw new Error("Shared secret is required. Define TRUE_SHARED_SECRET or SHARED_SECRET in your environment variables.");
    }

    this.endpoint_ =
      process.env.TRUE_AUTHENTICATION_ENDPOINT || process.env.AUTH_ENDPOINT;
    if (!this.endpoint_) {
      throw new Error("Authentication endpoint is required. Define TRUE_AUTHENTICATION_ENDPOINT or AUTH_ENDPOINT in your environment variables.");
    }

    this.serviceName_ =
      process.env.TRUE_SERVICE_NAME || process.env.SERVICE_NAME;
    if (!this.serviceName_) {
      throw new Error("Service name is required. Define TRUE_SERVICE_NAME or SERVICE_NAME in your environment variables.");
    }
  }

  token(audience) {
    const headers = {
      alg: ALGORITHM,
      typ: TOKEN_TYPE,
      kid: this.serviceName_
    };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceName_,
      aud: audience,
      iat: now,
      exp: now + (5 * 60) // Expira en 5 minutos
    };
    return jwt.sign(payload, this.sharedSecret_, { algorithm: ALGORITHM, header: headers });
  }

  async validate(token) {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Service": this.serviceName_
    };
    return await this.validateHeaders(headers);
  }

  async validateHeaders(headers) {
    try {
      const response = await axios.get(this.endpoint_, { headers });
      if (response.status === 200) {
        return response.data;
      } else if (response.status === 401) {
        throw new Error(`Authentication failed: ${JSON.stringify(response.data)}`);
      } else if (response.status === 400) {
        throw new Error(`Bad Request: ${JSON.stringify(response.data)}`);
      } else {
        throw new Error(`Unexpected status code ${response.status}`);
      }
    } catch (error) {
      console.error("An error occurred while making the request:", error.message);
      throw error;
    }
  }
}

module.exports = TrueAuth;
