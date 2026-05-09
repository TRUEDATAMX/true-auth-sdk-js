// Uses Web Crypto API (crypto.subtle) and native fetch instead of libraries like
// jsonwebtoken or axios. This is intentional, Next.js middleware runs on the
// Edge Runtime, which does not support Node.js built-ins that those libraries depend on.

const TOKEN_TYPE = "JWT";
const ALGORITHM = "HS256";

function b64url(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

class TrueAuth {
  constructor(sharedSecret = null, endpoint = null, serviceName = null) {
    this.sharedSecret = sharedSecret ?? process.env.TRUE_SHARED_SECRET ?? null;
    this.endpoint = endpoint ?? process.env.TRUE_AUTHENTICATION_ENDPOINT ?? null;
    this.serviceName = serviceName ?? process.env.TRUE_SERVICE_NAME;

    if (!this.serviceName) throw new Error("Must declare service name.");
    if (!this.sharedSecret) console.warn("No shared secret found. Unable to sign tokens.");
    if (!this.endpoint) console.warn("No authentication endpoint found. Unable to validate tokens.");
  }

  async token(audience) {
    if (!this.sharedSecret) throw new Error("Shared secret not available.");

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: ALGORITHM, typ: TOKEN_TYPE, kid: this.serviceName };
    const payload = { iss: this.serviceName, aud: audience, iat: now, exp: now + 300 };
    const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.sharedSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
    return `${signingInput}.${b64url(new Uint8Array(sig))}`;
  }

  async validate(token) {
    if (!this.endpoint) throw new Error("Validation endpoint not available.");

    const response = await fetch(this.endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Service: this.serviceName,
      },
    });

    if (response.status === 200) return response.json();
    if (response.status === 401) throw new Error(`Authentication failed: ${JSON.stringify(await response.json())}`);
    if (response.status === 400) throw new Error(`Bad request: ${JSON.stringify(await response.json())}`);
    throw new Error(`Unexpected status code ${response.status}`);
  }
}

module.exports = TrueAuth;