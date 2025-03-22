#FabillaPDFServiceJSClient
# TrueAuth SDK for Node.js

TrueAuth is a JavaScript library for generating and validating JSON Web Tokens (JWT) for secure service-to-service communication. It simplifies token creation and validation by leveraging environment variables for configuration.

## Features

- **JWT Generation**: Generate signed JWTs using a shared secret.
- **Token Validation**: Validate tokens against a configured authentication endpoint.
- **Environment Configuration**: Easily integrate into different environments by setting environment variables.
- **Simple Integration**: Designed to be the go-to SDK for authentication across your services.

## Installation

To install the SDK, run the following command:

```sh
npm install true-auth-sdk-js
```

Or install directly from GitHub

```sh
npm install git+https://github.com/TRUEDATAMX/true-auth-sdk-js.git
``` 

To install the required dependencies, run:

```sh
npm install
```

## Environment Variables

The SDK requires the following environment variables to function properly:

| Variable Name                  | Description                                              | Required |
|--------------------------------|----------------------------------------------------------|----------|
| `TRUE_SHARED_SECRET`           | Shared secret key used for signing JWTs.                 | Yes      |
| `TRUE_AUTHENTICATION_ENDPOINT` | Endpoint URL for validating tokens.                      | Yes      |
| `TRUE_SERVICE_NAME`            | Unique service name to identify the token issuer.        | Yes      |
| `AUDIENCE`                     | (Optional) Default audience for token generation.        | No       |

You can set these variables in your shell or using a .env file in the project root. For example, create a .env file with:
```sh
TRUE_SHARED_SECRET=your_shared_secret
TRUE_AUTHENTICATION_ENDPOINT=https://your-auth-endpoint/validate
TRUE_SERVICE_NAME=your_service_name
AUDIENCE=ExampleAudience
``` 
## Usage

### Importing the SDK

```javascript
const TrueAuth = require('true-auth-sdk-js');
```

### Generating a Token

```javascript
require('dotenv').config(); // Load environment variables from .env
const { TrueAuth } = require('./lib');

(async function() {
  try {
    const auth = new TrueAuth();
    const audience = process.env.AUDIENCE || "ExampleAudience";
    
    // Generar y mostrar el token
    const token = auth.token(audience);
    console.log("Generated Token:", token);
  } catch (error) {
    console.error("Initialization error:", error.message);
  }
})();
```

### Validating a Token

```javascript
(async function() {
  try {
    const auth = new TrueAuth();
    const token = "your_jwt_token_here";
    
    const validationResult = await auth.validate(token);
    console.log("Validation Result:", validationResult);
  } catch (error) {
    console.error("Error during validation:", error.message);
  }
})();
```

## License

This project is licensed under the MIT License.
