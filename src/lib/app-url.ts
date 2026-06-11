const PRODUCTION_APP_URL = "https://sibling-showdown.vercel.app";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getPublicAppUrl(browserOrigin?: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (browserOrigin && !browserOrigin.includes("localhost") && !browserOrigin.includes("127.0.0.1")) {
    return trimTrailingSlash(browserOrigin);
  }

  return PRODUCTION_APP_URL;
}

export function buildAuthCallbackUrl(nextPath: string, browserOrigin?: string) {
  const appUrl = getPublicAppUrl(browserOrigin);
  return `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}
