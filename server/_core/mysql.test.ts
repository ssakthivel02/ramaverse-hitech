import { afterEach, describe, expect, it } from "vitest";
import { DATABASE_CA_ENV, getMysqlConnectionOptions } from "./mysql";

const originalCa = process.env[DATABASE_CA_ENV];
const testCa = Buffer.from("-----BEGIN CERTIFICATE-----\nTEST-ONLY-CA\n-----END CERTIFICATE-----\n").toString("base64");

afterEach(() => {
  if (originalCa === undefined) delete process.env[DATABASE_CA_ENV];
  else process.env[DATABASE_CA_ENV] = originalCa;
});

describe("RamaVerse preview MySQL contract", () => {
  it("accepts only the ramaverse_preview logical database when that database is expected", () => {
    process.env[DATABASE_CA_ENV] = testCa;
    const options = getMysqlConnectionOptions(
      "mysql://preview-user:preview-pass@example.aivencloud.com:11349/ramaverse_preview",
      "ramaverse_preview",
    );

    expect(options.database).toBe("ramaverse_preview");
    expect(options.port).toBe(11349);
    expect(options.ssl).toMatchObject({ rejectUnauthorized: true, minVersion: "TLSv1.2" });
  });

  it("fails closed in production when the expected database identity is not configured", () => {
    process.env[DATABASE_CA_ENV] = testCa;
    expect(() =>
      getMysqlConnectionOptions(
        "mysql://preview-user:preview-pass@example.aivencloud.com:11349/ramaverse_preview",
        undefined,
        true,
        true,
      ),
    ).toThrow(/DATABASE_EXPECTED_NAME is required/);
  });

  it.each(["defaultdb", "sakthiai_preview", "kirthiverse_preview"])(
    "rejects cross-project or default database %s",
    database => {
      process.env[DATABASE_CA_ENV] = testCa;
      expect(() =>
        getMysqlConnectionOptions(
          `mysql://preview-user:preview-pass@example.aivencloud.com:11349/${database}`,
          "ramaverse_preview",
        ),
      ).toThrow(/must target ramaverse_preview/);
    },
  );

  it("requires the project CA for Aiven hosts", () => {
    delete process.env[DATABASE_CA_ENV];
    expect(() =>
      getMysqlConnectionOptions(
        "mysql://preview-user:preview-pass@example.aivencloud.com:11349/ramaverse_preview",
        "ramaverse_preview",
      ),
    ).toThrow(/DATABASE_CA_CERT_B64 is required/);
  });

  it("uses the system trust store for non-Aiven providers when production TLS is required", () => {
    delete process.env[DATABASE_CA_ENV];
    const options = getMysqlConnectionOptions(
      "mysql://preview-user:preview-pass@mysql.example.net:3306/ramaverse_preview",
      "ramaverse_preview",
      true,
      true,
    );

    expect(options.ssl).toMatchObject({ rejectUnauthorized: true, minVersion: "TLSv1.2" });
    expect(options.ssl).not.toHaveProperty("ca");
  });

  it("supports a custom CA for any MySQL provider", () => {
    process.env[DATABASE_CA_ENV] = testCa;
    const options = getMysqlConnectionOptions(
      "mysql://preview-user:preview-pass@mysql.example.net:3306/ramaverse_preview",
      "ramaverse_preview",
      true,
      true,
    );

    expect(options.ssl).toMatchObject({
      ca: "-----BEGIN CERTIFICATE-----\nTEST-ONLY-CA\n-----END CERTIFICATE-----\n",
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    });
  });

  it("does not force TLS for local/non-production tooling unless requested", () => {
    delete process.env[DATABASE_CA_ENV];
    const options = getMysqlConnectionOptions(
      "mysql://preview-user:preview-pass@localhost:3306/ramaverse_preview",
      "ramaverse_preview",
      false,
      false,
    );

    expect(options.ssl).toBeUndefined();
  });

  it("rejects non-MySQL schemes before any connection is attempted", () => {
    process.env[DATABASE_CA_ENV] = testCa;
    expect(() =>
      getMysqlConnectionOptions(
        "postgres://preview-user:preview-pass@example.aivencloud.com:11349/ramaverse_preview",
        "ramaverse_preview",
      ),
    ).toThrow(/mysql:\/\//);
  });
});
