import "dotenv/config";

import { Redis } from "@upstash/redis";
import Stripe from "stripe";

const requiredEnvVars = [
  "NEXT_PUBLIC_URL",
  "STRIPE_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

for (const envName of requiredEnvVars) {
  if (!process.env[envName]) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
}

const baseUrl = process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const endpointPath =
  process.env.STRIPE_WEBHOOK_REPLAY_ENDPOINT_PATH ?? "/api/webhooks/stripe";
const checkoutSessionId =
  process.env.STRIPE_WEBHOOK_REPLAY_SESSION_ID ?? "cs_test_replay_placeholder";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function main() {
  const stripeEventId = `evt_replay_${crypto.randomUUID().replaceAll("-", "")}`;
  const payload = JSON.stringify(createCheckoutCompletedEvent(stripeEventId));

  const processedKey = `stripe:webhook:${stripeEventId}`;
  const processingKey = `stripe:webhook:processing:${stripeEventId}`;

  await Promise.all([redis.del(processedKey), redis.del(processingKey)]);

  const firstAttempt = await sendWebhookAttempt(payload);
  const replayAttempt = await sendWebhookAttempt(payload);

  if (firstAttempt.status !== 200) {
    throw new Error(
      `Expected first delivery status 200, received ${firstAttempt.status}`,
    );
  }

  if (replayAttempt.status !== 200) {
    throw new Error(
      `Expected replay delivery status 200, received ${replayAttempt.status}`,
    );
  }

  const [processedExists, processingExists] = await Promise.all([
    redis.exists(processedKey),
    redis.exists(processingKey),
  ]);

  if (processedExists !== 1) {
    throw new Error("Webhook processed idempotency key was not persisted");
  }

  if (processingExists !== 0) {
    throw new Error("Webhook processing lock was not released");
  }

  console.log(
    JSON.stringify(
      {
        endpoint: `${baseUrl}${endpointPath}`,
        stripeEventId,
        firstStatus: firstAttempt.status,
        replayStatus: replayAttempt.status,
        processedKey,
      },
      null,
      2,
    ),
  );
}

function createCheckoutCompletedEvent(stripeEventId) {
  const now = Math.floor(Date.now() / 1000);

  return {
    id: stripeEventId,
    object: "event",
    api_version: "2025-09-30.clover",
    created: now,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "checkout.session.completed",
    data: {
      object: {
        id: checkoutSessionId,
        object: "checkout.session",
      },
    },
  };
}

async function sendWebhookAttempt(payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
    timestamp,
  });

  const response = await fetch(`${baseUrl}${endpointPath}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
      "x-request-id": `stripe-webhook-replay-${crypto.randomUUID()}`,
    },
    body: payload,
  });

  return {
    status: response.status,
    body: await readResponseBody(response),
  };
}

async function readResponseBody(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? (error.stack ?? error.message) : error,
  );
  process.exitCode = 1;
});
