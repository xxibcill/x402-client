import axios from "axios";
import { config } from "dotenv";
import { createRequire } from "module";
import type { Hex } from "x402-axios";

const require = createRequire(import.meta.url);
(globalThis as Record<string, unknown>).require = require;

config();

//
const privateKey = "0xea5aa9b3b309c2bb3086376f2e7d072f54ec1d11dcc78e18021e02d95e1cc430" as Hex;
const baseURL = "https://membit-payment-proxy-1019910606111.asia-southeast1.run.app";

// change endpoint path to test other membit APIs
// const endpointPath = "/posts/search?q=BTC";
const endpointPath = "/clusters/info?label=Bitcoin%20Yield%20Vaults";
// const endpointPath = "/clusters/search?q=BTC";

console.log(privateKey, baseURL, endpointPath);

if (!privateKey || !baseURL || !endpointPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}

async function main(): Promise<void> {
  const { withPaymentInterceptor, decodeXPaymentResponse, createSigner } = await import(
    "x402-axios"
  );
  const signer = await createSigner("base-sepolia", privateKey);

  const api = withPaymentInterceptor(
    axios.create({
      baseURL,
    }),
    signer,
  );

  const response = await api.get(endpointPath);
  console.log(response.data);

  const paymentHeader = response.headers["x-payment-response"];

  console.log(paymentHeader);

  if (paymentHeader) {
    const paymentResponse = decodeXPaymentResponse(paymentHeader);
    console.log(paymentResponse);
  }
}

main().catch(error => {
  console.error("Failed to fetch protected resource:");
  if (axios.isAxiosError(error)) {
    console.error(`  HTTP ${error.response?.status}: ${error.message}`);
    if (error.response?.data) {
      console.error("  Response:", error.response.data);
    }
  } else if (error instanceof Error) {
    console.error(`  ${error.message}`);
  } else {
    console.error("  Unknown error:", error);
  }
  process.exitCode = 1;
});
