import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const workflowPath = path.join(root, '.github/workflows/secret-leak-scan.yml');
const policyPath = path.join(root, 'SECRET_LEAK_SCANNING.md');

const workflow = fs.readFileSync(workflowPath, 'utf8');
const policy = fs.readFileSync(policyPath, 'utf8');

describe('secret leak scanning security contract', () => {
  it('runs on pull requests, main pushes, schedule, and manual dispatch', () => {
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('push:');
    expect(workflow).toContain('schedule:');
    expect(workflow).toContain('workflow_dispatch:');
  });

  it('uses full history and immutable action pins', () => {
    expect(workflow).toContain('fetch-depth: 0');
    expect(workflow).toContain('actions/checkout@11d5960a326750d5838078e36cf38b85af677262');
    expect(workflow).toContain('gitleaks/gitleaks-action@e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e');
    expect(workflow).not.toMatch(/uses:\s+[^\s]+@v\d+/);
  });

  it('keeps workflow permissions read-only', () => {
    expect(workflow).toMatch(/permissions:\s*\n\s+contents:\s+read/);
    expect(workflow).not.toMatch(/contents:\s+write/);
  });

  it('documents fail-closed handling and native-scanning boundary', () => {
    expect(policy).toContain('must not be bypassed merely to obtain a green build');
    expect(policy).toContain('does not enable GitHub-native Secret Scanning or Push Protection');
    expect(policy).toContain('Issue #50');
    expect(policy).toContain('Broad exclusions are prohibited');
  });
});
