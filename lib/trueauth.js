require('dotenv').config(); // Load environment variables from .env

const jwt = require('jsonwebtoken');
const axios = require('axios');

const TOKEN_TYPE = "JWT";
const ALGORITHM = "HS256";

class TrueAuth {
  constructor() {
    this.sharedSecret = process.env.TRUE_SHARED_SECRET;
    if (!this.sharedSecret) {
      throw new Error("TRUE_SHARED_SECRET is required in environment variables.");
    }

    this.endpoint = process.env.TRUE_AUTHENTICATION_ENDPOINT;
    if (!this.endpoint) {
      throw new Error("TRUE_AUTHENTICATION_ENDPOINT is required in environment variables.");
    }

    this.serviceName = process.env.TRUE_SERVICE_NAME;
    if (!this.serviceName) {
      throw new Error("TRUE_SERVICE_NAME is required in environment variables.");
    }
  }

  /**
   * Generates a JWT token signed with the shared secret.
   * @param {string} audience - The target audience for the token.
   * @returns {string} The generated JWT.
   */
  token(audience) {
    const headers = {
      alg: ALGORITHM,
      typ: TOKEN_TYPE,
      kid: this.serviceName
    };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceName,
      aud: audience,
      iat: now,
      exp: now + (5 * 60) // Expires in 5 minutes
    };
    return jwt.sign(payload, this.sharedSecret, { algorithm: ALGORITHM, header: headers });
  }

  /**
   * Validates a token by sending it to the authentication endpoint.
   * @param {string} token - The JWT token to validate.
   * @returns {Promise<object>} The validation result.
   */
  async validate(token) {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Service": this.serviceName
    };
    return await this.validateHeaders(headers);
  }

  /**
   * Validates headers by making an HTTP GET request.
   * @param {object} headers - The headers to send.
   * @returns {Promise<object>} The response data.
   */
  async validateHeaders(headers) {
    try {
      const response = await axios.get(this.endpoint, { headers });
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
