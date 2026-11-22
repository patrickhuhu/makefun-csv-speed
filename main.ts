import { closeSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';
import { run } from './solve.js';

setFlagsFromString('--no-incremental-marking');

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const cases = JSON.parse(readFileSync(join(inputDir, 'cases.json'), 'utf8'));
const output = openSync(join(outputDir, 'answers.json'), 'w');
try {
  writeFileSync(output, '[');
  for (const [index, { input }] of cases.entries()) {
    if (index !== 0) writeFileSync(output, ',');
    writeFileSync(output, JSON.stringify(run(input)));
  }
  writeFileSync(output, ']');
} finally {
  closeSync(output);
}
