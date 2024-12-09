#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';
import Matrix from '#/lib/matrix';
import Vector from '#/lib/vector';
import * as comb from '#/lib/combinatorics';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');
// const extraData = fs.readFileSync(path.join(__dirname, 'extraData.json'), 'utf-8');

async function prepare() {
  const matrix = new Matrix<string>().fromString(input, /./, (e) => e);

  const frequencyMap: Record<string, Vector[]> = {};

  matrix.forEach((row, col, freq) => {
    if (freq !== '.') {
      frequencyMap[freq!] = (frequencyMap[freq!] || []).concat(new Vector(col, row));
    }
  });

  return {
    frequencyMap,
    matrix,
  };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  const { frequencyMap, matrix } = data;

  const poleLocations = new Set<string>();

  Object.keys(frequencyMap).map((freq) => {
    const antennaeLocations = frequencyMap[freq];
    const allAntennaPairings = comb.generateAllPairings(antennaeLocations);

    allAntennaPairings.forEach((antennaPair: Vector[]) => {
      const [v1, v2] = antennaPair;

      const antinode1 = v2.add(v2.sub(v1));
      if (
        antinode1.x < matrix.n &&
        antinode1.x >= 0 &&
        antinode1.y < matrix.m &&
        antinode1.y >= 0
      ) {
        poleLocations.add(`${antinode1.x}, ${antinode1.y}`);
      }

      const antinode2 = v1.add(v1.sub(v2));
      if (
        antinode2.x < matrix.n &&
        antinode2.x >= 0 &&
        antinode2.y < matrix.m &&
        antinode2.y >= 0
      ) {
        poleLocations.add(`${antinode2.x}, ${antinode2.y}`);
      }
    });
  });

  console.log(poleLocations);

  return poleLocations.size;
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  const { frequencyMap, matrix } = data;
  const poleLocations = new Set<string>();

  Object.keys(frequencyMap).map((freq) => {
    const antennaeLocations = frequencyMap[freq];
    const allAntennaPairings = comb.generateAllPairings(antennaeLocations);

    allAntennaPairings.forEach((antennaPair: Vector[]) => {
      const [v1, v2] = antennaPair;

      const dir = v1.sub(v2).simplify();
      for (let i = 0; i < 1000; i++) {
        const pointer = v1.add(dir.scale(i));
        if (pointer.x < matrix.n && pointer.x >= 0 && pointer.y < matrix.m && pointer.y >= 0) {
          poleLocations.add(`${pointer.x}, ${pointer.y}`);
        } else {
          break;
        }
      }

      const oppositeDir = v2.sub(v1).simplify();
      for (let i = 0; i < 1000; i++) {
        const pointer = v2.add(oppositeDir.scale(i));
        if (pointer.x < matrix.n && pointer.x >= 0 && pointer.y < matrix.m && pointer.y >= 0) {
          poleLocations.add(`${pointer.x}, ${pointer.y}`);
        } else {
          break;
        }
      }
    });
  });

  return poleLocations.size;
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
