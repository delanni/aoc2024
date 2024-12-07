#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';
import * as comb from '#/lib/combinatorics';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

async function prepare() {
  const equations = input
    .trim()
    .split('\n')
    .map((e) => {
      const [result, inputs] = e
        .trim()
        .split(':')
        .map((e) => e.trim());

      return {
        result: Number(result),
        inputs: inputs.split(/\s+/).map(Number),
      };
    });

  return equations;
}

async function solution1(equations: Awaited<ReturnType<typeof prepare>>) {
  const validEquations = equations.filter((equation) => {
    const variants = generateOperationVariations(equation, ['+', '*']);

    return variants.some((variation) => isValid(variation));
  });

  return validEquations.reduce((acc, next) => {
    return acc + next.result;
  }, 0);
}

async function solution2(equations: Awaited<ReturnType<typeof prepare>>) {
  const validEquations = equations.filter((equation) => {
    const variants = generateOperationVariations(equation, ['+', '*', '||']);

    return variants.some((variation) => isValid(variation));
  });

  return validEquations.reduce((acc, next) => {
    return acc + next.result;
  }, 0);
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

function generateOperationVariations(
  equation: {
    result: number;
    inputs: number[];
  },
  operatorOptions: string[],
): { result: number; inputs: number[]; operators: string[] }[] {
  const operatorVariations = comb.generateAllVariations(
    operatorOptions,
    equation.inputs.length - 1,
  );

  return operatorVariations.map((operators) => ({
    ...equation,
    operators,
  }));
}

function isValid(variation: { result: number; inputs: number[]; operators: string[] }): unknown {
  let runningResult = variation.inputs[0];

  for (let i = 0; i < variation.operators.length; i++) {
    if (variation.operators[i] === '+') {
      runningResult += variation.inputs[i + 1];
    } else if (variation.operators[i] === '*') {
      runningResult *= variation.inputs[i + 1];
    } else if (variation.operators[i] === '||') {
      runningResult = Number(runningResult.toString() + variation.inputs[i + 1]);
    }

    if (runningResult > variation.result) {
      return false;
    }
  }

  return runningResult === variation.result;
}
