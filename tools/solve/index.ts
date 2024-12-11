#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';

import { select } from '@inquirer/prompts';

const root = tools.getProjectRoot();
const DEFAULT_SOLUTIONS_DIR = path.join(root, 'src', 'typescript', 'solutions');

const main = async () => {
  const solution =
    process.argv[2] ??
    (await select({
      message: 'Which solution do you want to run?',
      choices: fs
        .readdirSync(DEFAULT_SOLUTIONS_DIR)
        .map((n) => ({ value: n, name: n }))
        .reverse(),
    }));

  const part =
    process.argv[3] ??
    (await select({
      message: 'Which part do you want to run?',
      choices: [
        { value: '1', name: '1' },
        { value: '2', name: '2' },
      ],
    }));

  const solutionPath = path.join(DEFAULT_SOLUTIONS_DIR, solution, 'solution');

  try {
    // Using require instead of import for .ts files
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const solutionModule = require(solutionPath);

    await solutionModule.default(part);
    process.exit(0);
  } catch (err) {
    console.error('Failed to run solution:\n', err);
    process.exit(1);
  }
};

main();
