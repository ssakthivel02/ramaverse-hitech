import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const workflowPath = path.join(root, '.github/workflows/ossf-scorecard.yml');
const policyPath = path.join(root, 'OPENSSF_SCORECARD_SECURITY.md');

const workflow = fs.readFileSync(workflowPath, 'utf8');
const policy = fs.readFileSync(policyPath, 'utf8');

describe('OpenSSF Scorecard security contract', () => {
  it('runs on main push, schedule, and manual dispatch', () => {
    expect(workflow).toContain('push:');
    expect(workflow).toContain('branches:');
    expect(workflow).toContain('- main');
    expect(workflow).toContain('schedule:');
    expect(workflow).toContain('workflow_dispatch:');
  });

  it('pins all GitHub Actions to immutable commits', () => {
    expect(workflow).toContain('actions/checkout@11d5960a326750d5838078e36cf38b85af677262');
    expect(workflow).toContain('ossf/scorecard-action@2d1146689b8cda280b9bc96326124645441f03bc');
    expect(workflow).toContain('actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02');
    expect(workflow).not.toMatch(/uses:\s+[^\s]+@v\d+/);
  });

  it('uses bounded permissions and publishes SARIF evidence', () => {
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('security-events: write');
    expect(workflow).toContain('id-token: write');
    expect(workflow).not.toContain('contents: write');
    expect(workflow).toContain('results_format: sarif');
    expect(workflow).toContain('publish_results: true');
  });

  it('documents advisory scope and non-authorization boundaries', () => {
    expect(policy).toContain('advisory evidence');
    expect(policy).toContain('must not be bypassed merely to obtain a green build');
    expect(policy).toContain('Issue #40');
    expect(policy).toContain('Issue #48');
    expect(policy).toContain('Issue #50');
    expect(policy).toContain('does not authorize provider selection');
  });
});
