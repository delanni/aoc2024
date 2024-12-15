#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';
import Vector from '@/typescript/lib/vector';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const MAP_WIDTH = 101;
const MAP_HEIGHT = 103;

type Robot = {
  startPos: Vector;
  currentPos: Vector;
  velocity: Vector;
};

async function prepare() {
  const robots = input
    .trim()
    .split('\n')
    .map((line) => {
      const match = line.trim().match(/([0-9-]+)/g);
      if (match) {
        return {
          startPos: new Vector(Number(match[0]), Number(match[1])),
          currentPos: new Vector(Number(match[0]), Number(match[1])),
          velocity: new Vector(Number(match[2]), Number(match[3])),
        };
      } else {
        throw new Error('Malformed input line: ' + line);
      }
    });

  console.log(robots.slice(5));

  return {
    robots,
  };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  const { robots } = data;

  const quadrants: Record<'q1' | 'q2' | 'q3' | 'q4', Robot[]> = {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  };

  robots.forEach((r, i) => {
    r.currentPos = r.startPos.add(r.velocity.scale(100));
    r.currentPos.x = r.currentPos.x % MAP_WIDTH;
    if (r.currentPos.x < 0) {
      r.currentPos.x += MAP_WIDTH;
    }
    r.currentPos.y = r.currentPos.y % MAP_HEIGHT;
    if (r.currentPos.y < 0) {
      r.currentPos.y += MAP_HEIGHT;
    }

    console.log('R ' + i + ' is in ', r.currentPos);

    if (r.currentPos.x < Math.floor(MAP_WIDTH / 2) && r.currentPos.y < Math.floor(MAP_HEIGHT / 2)) {
      quadrants.q1.push(r);
    } else if (
      r.currentPos.x > Math.floor(MAP_WIDTH / 2) &&
      r.currentPos.y > Math.floor(MAP_HEIGHT / 2)
    ) {
      quadrants.q3.push(r);
    } else if (
      r.currentPos.x > Math.floor(MAP_WIDTH / 2) &&
      r.currentPos.y < Math.floor(MAP_HEIGHT / 2)
    ) {
      quadrants.q2.push(r);
    } else if (
      r.currentPos.x < Math.floor(MAP_WIDTH / 2) &&
      r.currentPos.y > Math.floor(MAP_HEIGHT / 2)
    ) {
      quadrants.q4.push(r);
    }
  });

  return quadrants.q1.length * quadrants.q2.length * quadrants.q3.length * quadrants.q4.length;
}

async function solution2(_data: Awaited<ReturnType<typeof prepare>>) {
  throw new Error('Solution 2 is in sim.html & solution.js');
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
