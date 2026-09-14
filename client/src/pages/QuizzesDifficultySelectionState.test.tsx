import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(path.join(process.cwd(), 'client/src/pages/Quizzes.tsx'), 'utf8');

describe('Quizzes difficulty selection accessibility contract', () => {
  it('exposes the selected difficulty with aria-pressed', () => {
    expect(source).toContain('aria-pressed={difficulty === diff}');
    expect(source).toContain('onClick={() => setDifficulty(diff)}');
  });
});
