#!/usr/bin/env ts-node

import * as process from 'process';
import * as tools from '#/lib/tools';

async function prepare() {}

async function solution1(_data: Awaited<ReturnType<typeof prepare>>) {
  throw new Error('This task was done in a visual setup, see: sim.html');
}

async function solution2(_data: Awaited<ReturnType<typeof prepare>>) {
  throw new Error('This task was done in a visual setup, see: sim2.html');
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
  main(process.argv[2])
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
