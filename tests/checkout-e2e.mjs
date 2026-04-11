import "dotenv/config";

import { Redis } from "@upstash/redis";
import { SignJWT, jwtVerify } from "jose";
import pg from "pg";
import Stripe from "stripe";

const requiredEnvVars = [
  "JWT_SECRET",
  "NEXT_PUBLIC_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "DATABASE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

for (const envName of requiredEnvVars) {
  if (!process.env[envName]) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
}

const baseUrl = process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const runId =
  process.env.CHECKOUT_E2E_RUN_ID ?? crypto.randomUUID().slice(0, 8);
const email = process.env.CHECKOUT_E2E_EMAIL ?? createDefaultTestEmail(runId);
const redirectToPurchase =
  process.env.CHECKOUT_E2E_REDIRECT_TO_PURCHASE !== "false";
const providedPaidSessionId = process.env.CHECKOUT_E2E_PAID_SESSION_ID;
const maxPollAttempts = Number(process.env.CHECKOUT_E2E_POLL_ATTEMPTS ?? "10");
const pollIntervalMs = Number(
  process.env.CHECKOUT_E2E_POLL_INTERVAL_MS ?? "2000",
);
const checkoutUiMode =
  process.env.CHECKOUT_E2E_UI_MODE === "embedded" ? "embedded" : "hosted";
const phaseMode = normalizePhaseMode(process.env.CHECKOUT_E2E_PHASE);
const eventPollAttempts = Number(
  process.env.CHECKOUT_E2E_EVENT_POLL_ATTEMPTS ?? "40",
);
const eventPollIntervalMs = Number(
  process.env.CHECKOUT_E2E_EVENT_POLL_INTERVAL_MS ?? "3000",
);

const { Client } = pg;

async function createToken(payload, expiration) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(jwtSecret);
}

async function main() {
  if (phaseMode === "phase2" && !process.env.CHECKOUT_E2E_EMAIL) {
    throw new Error(
      "CHECKOUT_E2E_EMAIL is required when CHECKOUT_E2E_PHASE=phase2. Reuse the email printed by phase1 so phase2 authenticates the same user.",
    );
  }

  if (phaseMode === "phase2" && !providedPaidSessionId) {
    throw new Error(
      "CHECKOUT_E2E_PAID_SESSION_ID is required when CHECKOUT_E2E_PHASE=phase2",
    );
  }

  const login = await loginWithMagicLink(email, redirectToPurchase);

  const initialUserSession = await getUserSession(login.cookieHeader);
  if (!initialUserSession.data?.isAuthenticated) {
    throw new Error("Expected authenticated session after magic-link login");
  }

  if (initialUserSession.data.userRole !== "BASIC" && phaseMode !== "phase2") {
    throw new Error(
      `Expected BASIC role after login, received ${initialUserSession.data.userRole}`,
    );
  }

  const authenticatedUserId = await getUserIdFromTokenCookie(
    login.cookieHeader,
  );

  if (phaseMode === "phase2") {
    await runPhase2(authenticatedUserId, login.cookieHeader);
    return;
  }

  const checkoutSession = await createCheckoutSession(
    authenticatedUserId,
    email,
    checkoutUiMode,
  );

  if (phaseMode === "phase1") {
    console.log(
      JSON.stringify(
        {
          success: true,
          phase: "phase1-ready",
          email,
          checkoutUiMode,
          authenticatedUserId,
          createdCheckoutSessionId: checkoutSession.id,
          checkoutUrl: checkoutSession.url,
          checkoutClientSecret: checkoutSession.client_secret,
          nextStep:
            "Complete payment, then run CHECKOUT_E2E_PHASE=phase2 CHECKOUT_E2E_EMAIL=<same-email> CHECKOUT_E2E_PAID_SESSION_ID=<session-id> npm run test:checkout-e2e",
        },
        null,
        2,
      ),
    );
    return;
  }

  const paidSession = await resolvePaidCheckoutSession(
    checkoutSession.id,
    providedPaidSessionId,
  );

  if (!paidSession) {
    console.log(
      JSON.stringify(
        {
          success: false,
          phase: "awaiting-payment",
          email,
          checkoutUiMode,
          authenticatedUserId,
          createdCheckoutSessionId: checkoutSession.id,
          checkoutUrl: checkoutSession.url,
          checkoutClientSecret: checkoutSession.client_secret,
          message:
            "Complete payment for createdCheckoutSessionId, then rerun with CHECKOUT_E2E_PAID_SESSION_ID set to that id.",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  await runPhase2(authenticatedUserId, login.cookieHeader, paidSession.id, {
    createdCheckoutSessionId: checkoutSession.id,
    initialRole: initialUserSession.data.userRole,
    checkoutUiMode,
  });
}

async function runPhase2(
  authenticatedUserId,
  loginCookieHeader,
  forcedSessionId,
  context = {},
) {
  const sessionId = forcedSessionId ?? providedPaidSessionId;

  if (!sessionId) {
    throw new Error("Missing checkout session id for phase 2");
  }

  const paidSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  if (paidSession.payment_status !== "paid") {
    throw new Error(
      `Expected paid checkout session, received payment_status=${paidSession.payment_status}`,
    );
  }

  const paidSessionUserId = paidSession.metadata?.userId;

  if (typeof paidSessionUserId !== "string" || paidSessionUserId.length === 0) {
    throw new Error("Paid checkout session metadata does not contain userId");
  }

  if (paidSessionUserId !== authenticatedUserId) {
    throw new Error(
      `Paid checkout session user mismatch: expected ${authenticatedUserId}, got ${paidSessionUserId}`,
    );
  }

  const stripeEvents = await waitForCheckoutWebhookEvents(sessionId);

  const webhookEvidence = await waitForWebhookIdempotency(
    stripeEvents.map((event) => event.id),
  );

  const roleAfterWebhook = await waitForDatabaseRole(
    authenticatedUserId,
    "PREMIUM",
  );

  const fulfillResult = await fulfillPremiumSession(
    paidSession.id,
    loginCookieHeader,
  );

  const upgradedCookieHeader = mergeCookieHeaders(
    loginCookieHeader,
    fulfillResult.setCookie,
  );

  const postFulfillmentSession = await getUserSession(upgradedCookieHeader);

  if (!postFulfillmentSession.data?.isAuthenticated) {
    throw new Error("Expected authenticated session after fulfillment");
  }

  if (postFulfillmentSession.data.userRole !== "PREMIUM") {
    throw new Error(
      `Expected PREMIUM role after fulfillment, received ${postFulfillmentSession.data.userRole}`,
    );
  }

  const lessonsResponse = await requestJson("/api/lessons", {
    method: "GET",
    cookieHeader: upgradedCookieHeader,
  });

  if (lessonsResponse.status !== 200 || lessonsResponse.body.success !== true) {
    throw new Error(
      `Expected premium lessons access after fulfillment, received status ${lessonsResponse.status}`,
    );
  }

  const firstLessonSlug = lessonsResponse.body.data?.lessons?.[0]?.slug;

  if (!firstLessonSlug) {
    throw new Error("No lessons found to validate signed video URL access");
  }

  const videoResponse = await requestJson(
    `/api/lessons/${firstLessonSlug}/video-url`,
    {
      method: "GET",
      cookieHeader: upgradedCookieHeader,
    },
  );

  if (videoResponse.status !== 200 || videoResponse.body.success !== true) {
    throw new Error(
      `Expected signed video URL after premium upgrade, received status ${videoResponse.status}`,
    );
  }

  const signedVideoData = videoResponse.body.data;

  if (
    !signedVideoData ||
    typeof signedVideoData !== "object" ||
    typeof signedVideoData.url !== "string" ||
    signedVideoData.url.length === 0 ||
    typeof signedVideoData.expiresAt !== "number"
  ) {
    throw new Error(
      `Video endpoint did not return expected signed URL payload: ${JSON.stringify(signedVideoData)}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        phase: "phase2-verified",
        email,
        checkoutUiMode: context.checkoutUiMode ?? checkoutUiMode,
        authenticatedUserId,
        createdCheckoutSessionId: context.createdCheckoutSessionId ?? null,
        fulfilledCheckoutSessionId: paidSession.id,
        webhookEventIds: stripeEvents.map((event) => event.id),
        webhookProcessedEventId: webhookEvidence.processedEventId,
        roleAfterWebhook,
        roleBeforeFulfillment: context.initialRole ?? null,
        roleAfterFulfillment: postFulfillmentSession.data.userRole,
        premiumLessonSlugValidated: firstLessonSlug,
      },
      null,
      2,
    ),
  );
}

async function createCheckoutSession(userId, userEmail, uiMode) {
  const sharedData = {
    line_items: [{ quantity: 1, price: process.env.STRIPE_PRICE_ID }],
    customer_email: userEmail,
    mode: "payment",
    payment_method_types: ["card"],
    metadata: { userId },
  };

  if (uiMode === "embedded") {
    return await stripe.checkout.sessions.create({
      ...sharedData,
      ui_mode: "embedded",
      return_url: `${baseUrl}/acing-aufnahmetest/purchase/result?session_id={CHECKOUT_SESSION_ID}`,
    });
  }

  return await stripe.checkout.sessions.create({
    ...sharedData,
    success_url: `${baseUrl}/acing-aufnahmetest/purchase/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/acing-aufnahmetest/purchase`,
  });
}

async function loginWithMagicLink(userEmail, shouldRedirectToPurchase) {
  const jti = crypto.randomUUID();
  const pendingKey = `magic_link:${jti}`;
  const consumedKey = `magic_link_consumed:${jti}`;

  const token = await createToken(
    {
      email: userEmail,
      redirectToPurchase: shouldRedirectToPurchase,
      jti,
    },
    "15min",
  );

  await redis.set(pendingKey, "pending", { ex: 60 * 15 });
  await redis.del(consumedKey);

  const response = await fetch(`${baseUrl}/api/auth?token=${token}`, {
    method: "GET",
    redirect: "manual",
    headers: {
      "x-request-id": `checkout-e2e-login-${jti}`,
    },
  });

  if (response.status < 300 || response.status >= 400) {
    throw new Error(
      `Expected auth redirect, received status ${response.status}`,
    );
  }

  const setCookie = response.headers.get("set-cookie");

  if (!setCookie || !setCookie.includes("token=")) {
    throw new Error("Magic-link login did not set token cookie");
  }

  return {
    cookieHeader: buildCookieHeader([setCookie]),
    redirectLocation: response.headers.get("location"),
  };
}

async function getUserIdFromTokenCookie(cookieHeader) {
  const token = readCookieValue(cookieHeader, "token");

  if (!token) {
    throw new Error("Missing token cookie after authentication");
  }

  const session = await jwtVerify(token, jwtSecret, { algorithms: ["HS256"] });

  const userId = session.payload?.userId;

  if (typeof userId !== "string") {
    throw new Error("Token payload does not contain userId");
  }

  return userId;
}

async function resolvePaidCheckoutSession(createdSessionId, paidSessionId) {
  if (paidSessionId) {
    return await stripe.checkout.sessions.retrieve(paidSessionId, {
      expand: ["line_items"],
    });
  }

  for (let attempt = 1; attempt <= maxPollAttempts; attempt += 1) {
    const session = await stripe.checkout.sessions.retrieve(createdSessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status === "paid") {
      return session;
    }

    await wait(pollIntervalMs);
  }

  return null;
}

async function waitForCheckoutWebhookEvents(sessionId) {
  const eventTypes = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ];

  for (let attempt = 1; attempt <= eventPollAttempts; attempt += 1) {
    const matches = [];

    for (const eventType of eventTypes) {
      const eventsPage = await stripe.events.list({
        type: eventType,
        limit: 100,
      });

      const matchingEvents = eventsPage.data.filter((event) => {
        const checkoutObject = event.data.object;

        return (
          checkoutObject &&
          typeof checkoutObject === "object" &&
          "id" in checkoutObject &&
          checkoutObject.id === sessionId
        );
      });

      matches.push(...matchingEvents);
    }

    if (matches.length > 0) {
      return dedupeByEventId(matches);
    }

    await wait(eventPollIntervalMs);
  }

  throw new Error(
    `Could not find checkout webhook events for session ${sessionId} after ${eventPollAttempts} attempts`,
  );
}

async function waitForWebhookIdempotency(eventIds) {
  if (eventIds.length === 0) {
    throw new Error(
      "No Stripe event IDs provided for webhook idempotency check",
    );
  }

  let latestSnapshot = [];

  for (let attempt = 1; attempt <= eventPollAttempts; attempt += 1) {
    latestSnapshot = await Promise.all(
      eventIds.map(async (eventId) => {
        const processedKey = `stripe:webhook:${eventId}`;
        const processingKey = `stripe:webhook:processing:${eventId}`;

        const [processedExists, processingExists] = await Promise.all([
          redis.exists(processedKey),
          redis.exists(processingKey),
        ]);

        return {
          eventId,
          processedExists,
          processingExists,
        };
      }),
    );

    const processed = latestSnapshot.find(
      (entry) => entry.processedExists === 1 && entry.processingExists === 0,
    );

    if (processed) {
      return {
        processedEventId: processed.eventId,
      };
    }

    await wait(eventPollIntervalMs);
  }

  throw new Error(
    `Webhook idempotency keys not in expected state. Checked event IDs: ${eventIds.join(", ")}. Snapshot: ${JSON.stringify(latestSnapshot)}. Ensure Stripe webhook delivery reaches ${baseUrl}/api/webhooks/stripe with the configured signing secret.`,
  );
}

function dedupeByEventId(events) {
  const map = new Map();

  for (const event of events) {
    map.set(event.id, event);
  }

  return Array.from(map.values());
}

async function waitForDatabaseRole(userId, expectedRole) {
  for (let attempt = 1; attempt <= eventPollAttempts; attempt += 1) {
    const role = await getUserRoleFromDatabase(userId);

    if (role === expectedRole) {
      return role;
    }

    await wait(eventPollIntervalMs);
  }

  throw new Error(
    `User role did not converge to ${expectedRole} in database for user ${userId}`,
  );
}

async function getUserRoleFromDatabase(userId) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const result = await client.query('SELECT role FROM "User" WHERE id = $1', [
      userId,
    ]);

    if (result.rowCount === 0) {
      throw new Error(`User not found in database: ${userId}`);
    }

    return result.rows[0].role;
  } finally {
    await client.end();
  }
}

async function fulfillPremiumSession(sessionId, cookieHeader) {
  const response = await fetch(`${baseUrl}/api/fulfill-premium-session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader,
      "x-request-id": `checkout-e2e-fulfill-${crypto.randomUUID()}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  const body = await readJsonSafely(response);

  if (response.status !== 200 || body.success !== true) {
    throw new Error(
      `Expected fulfill endpoint success, received status ${response.status} with payload ${JSON.stringify(body)}`,
    );
  }

  return {
    setCookie: response.headers.get("set-cookie"),
  };
}

async function getUserSession(cookieHeader) {
  const response = await requestJson("/api/user-session", {
    method: "GET",
    cookieHeader,
  });

  if (response.status !== 200 || response.body.success !== true) {
    throw new Error(
      `Failed to fetch user session, status ${response.status}, payload ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
}

async function requestJson(path, { method, cookieHeader }) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie: cookieHeader,
      "x-request-id": `checkout-e2e-${crypto.randomUUID()}`,
    },
  });

  return {
    status: response.status,
    body: await readJsonSafely(response),
  };
}

async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function readCookieValue(cookieHeader, cookieName) {
  const parts = cookieHeader.split(";").map((part) => part.trim());

  for (const part of parts) {
    if (part.startsWith(`${cookieName}=`)) {
      return part.slice(cookieName.length + 1);
    }
  }

  return null;
}

function buildCookieHeader(setCookieValues) {
  const map = new Map();

  for (const setCookie of setCookieValues) {
    const cookiePair = setCookie.split(";")[0];
    const separatorIndex = cookiePair.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookiePair.slice(0, separatorIndex);
    const value = cookiePair.slice(separatorIndex + 1);
    map.set(name, value);
  }

  return Array.from(map.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function mergeCookieHeaders(existingCookieHeader, newSetCookieHeader) {
  if (!newSetCookieHeader) {
    return existingCookieHeader;
  }

  const setCookieValues = splitCombinedSetCookieHeader(newSetCookieHeader);
  const existingSetCookieValues = existingCookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.includes("="));

  const combined = [
    ...existingSetCookieValues.map((part) => `${part}; Path=/`),
    ...setCookieValues,
  ];

  return buildCookieHeader(combined);
}

function splitCombinedSetCookieHeader(value) {
  const matches = value.match(
    /(?:^|,\s*)([^=;,\s]+=[^,]+?)(?=,\s*[^=;,\s]+=|$)/g,
  );

  if (!matches) {
    return [value];
  }

  return matches.map((part) => part.replace(/^,\s*/, "").trim());
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePhaseMode(value) {
  if (value === "phase1" || value === "phase2") {
    return value;
  }

  return "auto";
}

function createDefaultTestEmail(id) {
  return `checkout-e2e+${id}@example.com`;
}

main().catch((error) => {
  console.error(
    error instanceof Error ? (error.stack ?? error.message) : error,
  );
  process.exitCode = 1;
});
