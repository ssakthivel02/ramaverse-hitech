import { describe, expect, it } from "vitest";
import { CONTENT_SECURITY_POLICY_REPORT_ONLY } from "./csp";

const directives = Object.fromEntries(
  CONTENT_SECURITY_POLICY_REPORT_ONLY.split(";").map(part => {
    const [name, ...values] = part.trim().split(/\s+/);
    return [name, values];
  }),
);

describe("report-only CSP candidate", () => {
  it("allows only same-origin scripts, with no unsafe-eval or unsafe-inline", () => {
    expect(directives["script-src"]).toEqual(["'self'"]);
    expect(CONTENT_SECURITY_POLICY_REPORT_ONLY).not.toContain("unsafe-eval");
    expect(directives["script-src"]).not.toContain("'unsafe-inline'");
  });

  it("locks down plugins, base URI and form targets", () => {
    expect(directives["object-src"]).toEqual(["'none'"]);
    expect(directives["base-uri"]).toEqual(["'self'"]);
    expect(directives["form-action"]).toEqual(["'self'"]);
    expect(directives["frame-ancestors"]).toEqual(["'self'"]);
  });

  it("keeps the font hosts the app currently loads and no other third-party script or connect origin", () => {
    expect(directives["style-src"]).toContain("https://fonts.googleapis.com");
    expect(directives["font-src"]).toContain("https://fonts.gstatic.com");
    // Service-worker pass-through of font requests is governed by connect-src; no other origin is allowed.
    expect(directives["connect-src"]).toEqual(["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
    expect(directives["worker-src"]).toEqual(["'self'"]);
  });
});
