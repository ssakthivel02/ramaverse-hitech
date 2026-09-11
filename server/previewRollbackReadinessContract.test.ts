import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/preview-rollback-readiness.yml', 'utf8');

describe('preview rollback readiness governance', () => {
  it('requires explicit owner approval and an older rollback target', () => {
    expect(workflow).toContain('owner_rollback_approval');
    expect(workflow).toContain('Explicit owner rollback approval is required.');
    expect(workflow).toContain('git merge-base --is-ancestor');
    expect(workflow).toContain('Rollback target must differ from current deployed commit.');
  });

  it('requires successful target release evidence before declaring readiness', () => {
    expect(workflow).toContain('RamaVerse Quality Gate');
    expect(workflow).toContain('RamaVerse Preview Deployment Preflight');
    expect(workflow).toContain('RamaVerse Preview Release Candidate');
    expect(workflow).toContain('PREVIEW_ROLLBACK_READY');
  });

  it('does not perform rollback or authorize production', () => {
    expect(workflow).toContain('execution_performed: false');
    expect(workflow).toContain('preview_scope_only: true');
    expect(workflow).toContain('production_ready: false');
    expect(workflow).toContain('production_dns_change_allowed: false');
    expect(workflow).toContain('production_deployment_change_allowed: false');
    expect(workflow).not.toContain('wrangler deploy');
    expect(workflow).not.toContain('render deploy');
  });
});
