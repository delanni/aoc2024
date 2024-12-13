#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';
import * as combinatorics from '#/lib/combinatorics';
import Vector from '@/typescript/lib/vector';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Task = {
  buttonA: Vector;
  buttonB: Vector;
  target: Vector;
};

async function prepare() {
  const taskDescriptions = input.split('\n\n').map((t) => t.trim());
  const tasks: Task[] = taskDescriptions.map((s) => {
    const match = s.match(/(\d+)/g);
    if (!match || !(match.length >= 6)) {
      throw new Error('Malformed input: ' + s);
    }
    const [ax, ay, bx, by, prizex, prizey] = match.map(Number);
    return {
      buttonA: new Vector(ax, ay),
      buttonB: new Vector(bx, by),
      target: new Vector(prizex, prizey),
    };
  });

  return { tasks };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  // for each task
  const { tasks } = data;

  // solve task:

  const solutionCosts = tasks.map((task) => {
    // A * aX + B * bX = pX
    // A * aY + B * bY = pY
    // A<100, B<100
    // prefer B > A (B*3 = A)
    const solutions: { a: number; b: number }[] = [];

    for (let a = 0; a < 100; a++) {
      for (let b = 0; b < 100; b++) {
        if (a * task.buttonA.x + b * task.buttonB.x === task.target.x) {
          if (a * task.buttonA.y + b * task.buttonB.y === task.target.y) {
            solutions.push({ a, b });
          }
        }
        if (
          a * task.buttonA.x + b * task.buttonB.x > task.target.x ||
          a * task.buttonA.y + b * task.buttonB.y > task.target.y
        ) {
          break;
        }
      }
    }

    if (!solutions.length) {
      return 0;
    }

    const minCost = Math.min(...solutions.map(({ a, b }) => a * 3 + b));
    return minCost;
  });

  return tools.sum(solutionCosts);
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  const { tasks } = data;
  tasks.forEach((t) => {
    t.target.x += 10000000000000;
    t.target.y += 10000000000000;
  });

  const solvableTasks = tasks.filter((task) => {
    const { buttonA: a, buttonB: b, target } = task;

    // target.x % gcd(a.x, b.x) === 0
    // target.y % gcd(a.y, b.y) === 0
    const gcdX = combinatorics.greatestCommonDivisor(a.x, b.x);
    if (target.x % gcdX === 0) {
      const gcdY = combinatorics.greatestCommonDivisor(a.y, b.y);
      return target.y % gcdY === 0;
    } else {
      return false;
    }
  });

  console.log(`Solvable tasks: ${solvableTasks.length} / ${tasks.length}`);

  const solutionCosts = tasks.map((task) => {
    const { target, buttonA, buttonB } = task;
    // A * aX + B * bX = tX
    // A * aY + B * bY = tY
    // prefer B > A (B*3 = A) // would be only an issue if they're replaeable
    const solutions: { a: number; b: number }[] = [];

    // equations:
    /**
     * A = (ty * bx - by * tx) / (ay * bx - by * ax)
     * B = (ty * ax - ay * tx) / (by * ax - ay * bx)
     */
    const [ax, ay] = [buttonA.x, buttonA.y];
    const [bx, by] = [buttonB.x, buttonB.y];
    const [tx, ty] = [target.x, target.y];

    const a = (ty * bx - by * tx) / (ay * bx - by * ax);
    const b = (ty * ax - ay * tx) / (by * ax - ay * bx);
    if (a === Math.round(a) && a >= 0 && b === Math.round(b) && b >= 0) {
      solutions.push({ a, b });
    }

    if (!solutions.length) {
      return 0;
    }

    const minCost = Math.min(...solutions.map(({ a, b }) => a * 3 + b));
    return minCost;
  });

  return tools.sum(solutionCosts);
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
