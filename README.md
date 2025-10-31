# x402-Axios

An example client that demonstrates how to use the `x402-axios` package to interact with a paywall-protected API.

## Requirements

- Node.js v20+
- pnpm v10
- A running x402 server (e.g., the [Express server example](../../servers/express))
- A private key for signing transactions
- USDC on Base Sepolia (get some from the [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet))

## Getting started

To start, install the dependencies from the `typescript` examples directory:

```bash
cd examples/typescript
pnpm install
```

Then, copy `.env-local` to `.env` and fill in the required values:

```bash
cp .env-local .env
```

Finally, run the client:

```bash
pnpm dev
```

## Example

The client will make a request to the protected endpoint. If the request requires payment, the client will automatically handle the payment flow:

```typescript
import axios from "axios";
import { config } from "dotenv";
import { withPaymentInterceptor, decodeXPaymentResponse, createSigner, type Hex } from "x402-axios";

config();

const privateKey = process.env.PRIVATE_KEY as Hex | string;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather

async function main(): Promise<void> {
  const signer = await createSigner("base-sepolia", privateKey);

  const api = withPaymentInterceptor(
    axios.create({
      baseURL,
    }),
    signer,
  );

  const response = await api.get(endpointPath);
  console.log(response.data);

  const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
  console.log(paymentResponse);
}

main();
```
