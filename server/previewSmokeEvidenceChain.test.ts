import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const integration = readFileSync('.github/workflows/integration-gate.yml', 'utf8');
const smoke = readFileSync('.github/workflows/preview-http-smoke.yml', 'utf8');

describe('preview smoke evidence chain', () => {
  it('emits live integration evidence only after canonical DB tests', () => {
    expect(integration).toContain('LIVE_INTEGRATION_PASS');
    expect(integration).toContain('canonical_database_tests_passed:true');
    expect(integration.indexOf('Canonical database tests')).toBeLessThan(
      integration.indexOf('Create live integration evidence'),
    );
    expect(integration).toContain('live-integration-${{ github.sha }}');
  });

  it('requires exact successful integration evidence before deployed HTTP checks', () => {
    expect(smoke).toContain('integration_run_id');
    expect(smoke).toContain('Verify matching live integration evidence');
    expect(smoke).toContain('.name == "RamaVerse Integration Gate"');
    expect(smoke).toContain('.head_sha == $sha');
    expect(smoke).toContain('.conclusion == "success"');
    expect(smoke).toContain('LIVE_INTEGRATION_PASS');
    expect(smoke.indexOf('Verify matching live integration evidence')).toBeLessThan(
      smoke.indexOf('Verify exact deployed release identity'),
    );
  });
});
