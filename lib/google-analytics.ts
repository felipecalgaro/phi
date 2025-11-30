declare global {
  interface Window {
    gtag: unknown;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export function registerPageView(url: string) {
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

export function registerAnalyticsEvent(
  action: string,
  params?: Record<string, unknown>
) {
  if (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    GA_MEASUREMENT_ID
  ) {
    window.gtag("event", action, params);
  }
}
