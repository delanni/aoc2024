#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');
const extraData = fs.readFileSync(path.join(__dirname, 'extraData.json'), 'utf-8');

async function prepare() {
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
}

async function main(part: string) {
  const data = await tools.time(prepare, 'prepare');

  if (part === '1') {
    const result1 = await tools.time(() => solution1(data), 'solution1');
    console.log('Solution for 1: \n', result1);
  } else if (part === '2') {
    const result2 = await tools.time(() => solution2(data), 'solution2');
    console.log('Solution for 2: \n', result2);
  }
}

main(process.argv[2])
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
