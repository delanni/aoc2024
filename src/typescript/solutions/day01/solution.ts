#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

async function prepare() {
  const q1: number[] = [];
  const q2: number[] = [];
  input
    .trim()
    .split('\n')
    .forEach((row) => {
      const [e1, e2] = row.trim().split(/\s+/g);
      q1.push(+e1);
      q2.push(+e2);
    });

  return { q1, q2 };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  data.q1.sort((a, b) => a - b);
  data.q2.sort((a, b) => a - b);

  const diffs = data.q1.map((n, idx) => Math.abs(n - data.q2[idx]));
  const diffSum = diffs.reduce((a, b) => a + b, 0);
  return diffSum;
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  let similarityScore = 0;

  data.q1.forEach((el) => {
    const q2Similars = data.q2.filter((e) => e === el);

    similarityScore += tools.sum(q2Similars);
  });

  return similarityScore;
}

export default async function main(part: string) {
  const data = await tools.time(prepare, 'prepare');

  if (part === '1') {
    const result1 = await tools.time(() => solution1(data), 'solution1');
    console.log('Solution for 1: \n', result1);
  } else if (part === '2') {
    const result2 = await tools.time(() => solution2(data), 'solution2');
    console.log('Solution for 2: \n', result2);
  }
}

if (require.main === module) {
  const part = process.argv[2];

  main(part)
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
