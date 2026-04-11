import "dotenv/config";

import { Redis } from "@upstash/redis";
import { SignJWT } from "jose";

const requiredEnvVars = [
  "JWT_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_URL",
];

for (const envName of requiredEnvVars) {
  if (!process.env[envName]) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const encoder = new TextEncoder();
const secretKey = encoder.encode(process.env.JWT_SECRET);

const attempts = Number(process.env.MAGIC_LINK_REPLAY_ATTEMPTS ?? "10");
const baseUrl = process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
const email = process.env.MAGIC_LINK_REPLAY_EMAIL ?? "replay-test@example.com";
const redirectToPurchase =
  process.env.MAGIC_LINK_REPLAY_REDIRECT_TO_PURCHASE !== "false";
const jti = crypto.randomUUID();
const pendingKey = `magic_link:${jti}`;
const consumedKey = `magic_link_consumed:${jti}`;

async function createToken(payload, expiration) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secretKey);
}

async function main() {
  const token = await createToken(
    {
      email,
      redirectToPurchase,
      jti,
    },
    "15min",
  );

  await redis.set(pendingKey, "pending", { ex: 60 * 15 });
  await redis.del(consumedKey);

  const startBarrier = createBarrier(attempts);
  const requestResults = await Promise.all(
    Array.from({ length: attempts }, async (_, index) => {
      await startBarrier.wait();

      const response = await fetch(`${baseUrl}/api/auth?token=${token}`, {
        method: "GET",
        redirect: "manual",
        headers: {
          "x-request-id": `magic-link-replay-${jti}-${index}`,
        },
      });

      return {
        status: response.status,
        location: response.headers.get("location"),
        setCookie: response.headers.get("set-cookie"),
        body: await readResponseBody(response),
      };
    }),
  );

  const successResponses = requestResults.filter(
    (result) => result.status >= 300 && result.status < 400,
  );
  const invalidTokenResponses = requestResults.filter(
    (result) => result.status === 400 && result.body.includes("Invalid token"),
  );
  const rateLimitedResponses = requestResults.filter(
    (result) => result.status === 429,
  );

  if (successResponses.length !== 1) {
    throw new Error(
      `Expected exactly 1 success response, received ${successResponses.length}`,
    );
  }

  if (invalidTokenResponses.length !== attempts - 1) {
    if (rateLimitedResponses.length > 0) {
      throw new Error(
        `Expected ${attempts - 1} invalid token responses, but ${rateLimitedResponses.length} request(s) were rate-limited instead. Lower MAGIC_LINK_REPLAY_ATTEMPTS to 10 or below, or wait for the auth rate-limit window to clear.`,
      );
    }

    throw new Error(
      `Expected ${attempts - 1} invalid token responses, received ${invalidTokenResponses.length}`,
    );
  }

  if (!successResponses[0].setCookie) {
    throw new Error("Successful response did not set a session cookie");
  }

  const pendingValue = await redis.get(pendingKey);
  const consumedValue = await redis.get(consumedKey);

  if (pendingValue !== null) {
    throw new Error("Pending magic-link marker was not cleared");
  }

  if (consumedValue === null) {
    throw new Error("Consumed marker was not written");
  }

  console.log(
    JSON.stringify(
      {
        attempts,
        successResponses: successResponses.length,
        invalidTokenResponses: invalidTokenResponses.length,
        rateLimitedResponses: rateLimitedResponses.length,
        redirectLocation: successResponses[0].location,
      },
      null,
      2,
    ),
  );
}

function createBarrier(expectedParticipants) {
  let arrived = 0;
  let release;

  const ready = new Promise((resolve) => {
    release = resolve;
  });

  return {
    async wait() {
      arrived += 1;

      if (arrived === expectedParticipants) {
        release();
      }

      await ready;
    },
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
