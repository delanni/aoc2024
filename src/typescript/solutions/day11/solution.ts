#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

async function prepare() {
  const pebbles = input.trim().split(/\s+/).map(Number);

  return {
    pebbles,
  };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  let { pebbles } = data;

  for (let i = 0; i < 25; i++) {
    pebbles = pebbles.flatMap((pebble) => transformPebble(pebble));
  }

  return pebbles.length;
}

function transformPebble(pebble: number): number[] {
  if (pebble === 0) {
    return [1];
  } else if (pebble.toString().length % 2 === 0) {
    const pebbleStr = pebble.toString();
    return [pebbleStr.slice(0, pebbleStr.length / 2), pebbleStr.slice(pebbleStr.length / 2)].map(
      Number,
    );
  } else {
    return [pebble * 2024];
  }
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  const { pebbles } = data;
  let totalPebbleCount = 0;
  // Store count per kind
  let pebbleLookupMap: {
    [pebbleNumber: string]: number;
  } = {};

  pebbles.forEach((n) => {
    pebbleLookupMap[n] = 1;
    totalPebbleCount += 1;
  });

  for (let i = 0; i < 75; i++) {
    const newPebblesState: typeof pebbleLookupMap = {};
    Object.keys(pebbleLookupMap).forEach((_pebbleId: string) => {
      const pebbleId = Number(_pebbleId);
      const pebbleCount = pebbleLookupMap[pebbleId];

      if (_pebbleId.length % 2 === 0) {
        const p1 = Number(_pebbleId.slice(0, _pebbleId.length / 2));
        const p2 = Number(_pebbleId.slice(_pebbleId.length / 2));
        newPebblesState[p1] = (newPebblesState[p1] || 0) + pebbleCount;
        newPebblesState[p2] = (newPebblesState[p2] || 0) + pebbleCount;
        totalPebbleCount += pebbleCount;
      } else if (pebbleId === 0) {
        newPebblesState[1] = (newPebblesState[1] || 0) + pebbleCount;
      } else {
        newPebblesState[pebbleId * 2024] = (newPebblesState[pebbleId * 2024] || 0) + pebbleCount;
      }
    });

    pebbleLookupMap = newPebblesState;
  }

  return totalPebbleCount;
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
