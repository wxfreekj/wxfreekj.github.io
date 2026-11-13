#!/usr/bin/env node
'use strict';
/**
 * Validates the published CSSLP question pool.
 * Run: node csslpprep/validate-question-bank.cjs
 * Does not require third-party packages or network access.
 */
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, 'question-bank.js');
const prefix = 'window.CSSLP_BANK=';
const source = fs.readFileSync(file, 'utf8').trim();
if (!source.startsWith(prefix) || !source.endsWith(';')) {
  throw Error('Unexpected question-bank.js format: expected window.CSSLP_BANK JSON assignment');
}
const questions = JSON.parse(source.slice(prefix.length, -1));
const errors = [];
const norm = value => String(value ?? '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const seenChoices = new Map();
const seenStems = new Set();
const perDomain = Array(8).fill(0);
if (questions.length !== 800) errors.push('Expected 800 items, found ' + questions.length);
questions.forEach((q, index) => {
  const id = index + 1;
  if (!Number.isInteger(q.domain) || q.domain < 0 || q.domain > 7) errors.push('Question ' + id + ': invalid domain');
  else perDomain[q.domain]++;
  if (!Array.isArray(q.choices) || q.choices.length !== 4) {
    errors.push('Question ' + id + ': expected four answer choices');
    return;
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= 4) {
    errors.push('Question ' + id + ': invalid answer key');
  }
  if (!norm(q.stem) || !norm(q.explanation)) errors.push('Question ' + id + ': missing stem or explanation');
  if (seenStems.has(norm(q.stem))) errors.push('Question ' + id + ': repeated question stem');
  seenStems.add(norm(q.stem));
  const local = new Set();
  q.choices.forEach((choice, optionIndex) => {
    const value = norm(choice);
    if (!value) errors.push('Question ' + id + ': empty choice ' + (optionIndex + 1));
    if (local.has(value)) errors.push('Question ' + id + ': duplicate within question');
    local.add(value);
    if (seenChoices.has(value)) {
      errors.push('Question ' + id + ', choice ' + (optionIndex + 1) + ': repeats choice from question ' + seenChoices.get(value));
    } else {
      seenChoices.set(value, id);
    }
  });
});
perDomain.forEach((count, index) => {
  if (count !== 100) errors.push('Domain ' + (index + 1) + ': expected 100 items, got ' + count);
});
if (errors.length) {
  console.error('CSSLP bank failed validation:\n' + errors.slice(0, 40).join('\n'));
  if (errors.length > 40) console.error('...plus ' + (errors.length - 40) + ' more errors');
  process.exitCode = 1;
} else {
  console.log('CSSLP bank passed: ' + questions.length + ' questions; ' + seenChoices.size +
              ' globally unique choices; 100 questions per domain; no invalid keys.');
}
