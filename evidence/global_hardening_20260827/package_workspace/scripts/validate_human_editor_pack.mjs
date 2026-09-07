import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const decisions = JSON.parse(fs.readFileSync(path.join(root, 'HUMAN_EDITOR_DECISIONS.json'), 'utf8'));
const md = fs.readFileSync(path.join(root, 'HUMAN_EDITOR_DECISION_PACK.md'), 'utf8');
const p1 = fs.readFileSync(path.join(root, 'P1_TAMIL_DIALOGUE_REVIEW.md'), 'utf8');
const varSum = fs.readFileSync(path.join(root, 'VARIANT_DECISION_SUMMARY.md'), 'utf8');

console.log(`Loaded ${decisions.decisions.length} decisions.`);

if (decisions.decisions.length !== 6 || !md || !p1 || !varSum) {
  console.error("Human Editor Decision Pack Validation FAILED!");
  process.exit(1);
} else {
  console.log("Human Editor Decision Pack Validation PASSED successfully!");
}
