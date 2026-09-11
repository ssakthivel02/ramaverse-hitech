import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const smoke = readFileSync('.github/workflows/preview-http-smoke.yml', 'utf8');
const acceptance = readFileSync('.github/workflows/preview-acceptance-gate.yml', 'utf8');

describe('preview acceptance evidence chain', () => {
  it('emits deployed preview smoke evidence only after HTTP/security checks', () => {
    expect(smoke).toContain('DEPLOYED_PREVIEW_SMOKE_PASS');
    expect(smoke).toContain('release_identity_verified:true');
    expect(smoke).toContain('readiness_verified:true');
    expect(smoke).toContain('security_headers_verified:true');
    expect(smoke.indexOf('Verify response security and operational cache headers')).toBeLessThan(
      smoke.indexOf('Create deployed preview smoke evidence'),
    );
    expect(smoke).toContain('deployed-preview-smoke-${{ inputs.expected_commit }}');
  });

  it('requires exact successful smoke evidence and explicit owner acceptance', () => {
    expect(acceptance).toContain('confirm_owner_preview_acceptance');
    expect(acceptance).toContain('preview_smoke_run_id');
    expect(acceptance).toContain('.name == "RamaVerse Preview HTTP Smoke"');
    expect(acceptance).toContain('.head_sha == $sha');
    expect(acceptance).toContain('.conclusion == "success"');
    expect(acceptance).toContain('DEPLOYED_PREVIEW_SMOKE_PASS');
    expect(acceptance).toContain('PREVIEW_ACCEPTANCE_PASS');
    expect(acceptance.indexOf('Verify matching deployed preview smoke evidence')).toBeLessThan(
      acceptance.indexOf('Create preview acceptance evidence'),
    );
  });

  it('keeps production fail-closed after preview acceptance', () => {
    expect(acceptance).toContain('production_ready:false');
    expect(acceptance).toContain('production_dns_change_allowed:false');
    expect(acceptance).toContain('production_deployment_change_allowed:false');
    expect(acceptance).not.toContain('wrangler deploy');
    expect(acceptance).not.toContain('render deploy');
    expect(acceptance).not.toContain('cloudflare');
  });
});
