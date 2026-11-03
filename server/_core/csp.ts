/**
 * Report-only Content-Security-Policy candidate.
 *
 * This is NOT enforced. It is a stricter candidate than the previous policy: no 'unsafe-eval' and no
 * 'unsafe-inline' for scripts. The production artifact contains no executable inline script (the JSON-LD
 * block is inert data), no inline event handlers and no first-party eval/new Function usage.
 * 'unsafe-inline' remains for styles only because UI libraries apply runtime style attributes/elements.
 * Moving to enforcement requires browser evidence of zero violations across the public journeys plus
 * owner release authorization.
 */
export const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "script-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  // The service worker re-fetches cross-origin requests (client/public/sw.js), so the font hosts must also be
  // allowed here or an ENFORCED policy would block Google Fonts (Tamil/Indic families) on controlled pages.
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
].join("; ");
