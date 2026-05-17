declare global {
  interface Window {
    gtag: unknown;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function gtagReady(maxRetries = 10, delayMs = 100): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0;

    function check() {
      if (
        typeof window !== "undefined" &&
        typeof window.gtag === "function" &&
        GA_MEASUREMENT_ID
      ) {
        resolve();
      } else if (attempts < maxRetries) {
        attempts++;
        setTimeout(check, delayMs);
      } else {
        resolve();
      }
    }

    check();
  });
}

export async function registerPageView(url: string) {
  await gtagReady();

  if (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    GA_MEASUREMENT_ID
  ) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

export async function registerAnalyticsEvent(
  action: string,
  params?: Record<string, unknown>
) {
  await gtagReady();

  if (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    GA_MEASUREMENT_ID
  ) {
    window.gtag("event", action, params);
  }
}
