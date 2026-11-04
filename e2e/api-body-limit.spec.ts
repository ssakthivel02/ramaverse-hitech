import { expect, test } from "@playwright/test";

// The API only accepts small JSON inputs (the sole mutation is logout). Oversized anonymous bodies must be
// refused before they are buffered and parsed, otherwise any visitor can make the server allocate tens of MB.
const padded = (bytes: number) => ({ json: { pad: "x".repeat(bytes) } });

test("rejects an oversized anonymous JSON body with 413 before parsing it", async ({ request }) => {
  const response = await request.post("/api/trpc/auth.logout", { data: padded(2 * 1024 * 1024) });
  expect(response.status()).toBe(413);
});

test("rejects an oversized urlencoded body with 413", async ({ request }) => {
  const response = await request.post("/api/trpc/auth.logout", {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: `pad=${"x".repeat(2 * 1024 * 1024)}`,
  });
  expect(response.status()).toBe(413);
});

test("still accepts a normal small request body", async ({ request }) => {
  const response = await request.post("/api/trpc/auth.logout", { data: padded(1024) });
  expect(response.status()).not.toBe(413);
  expect(response.status()).toBeLessThan(500);
});
