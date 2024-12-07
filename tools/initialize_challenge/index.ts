import { input, select, confirm } from '@inquirer/prompts';
import {
  GeneratorConfig,
  getAvailableTemplates,
  getProjectRoot,
  copyTemplateFiles,
  getSuggestedSolutionPath,
} from './lib';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

async function fetchInput(day: number, year: number): Promise<string> {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
    headers: {
      Cookie: `session=${process.env.AOC_SESSION}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch input: ${response.statusText}`);
  }

  return response.text();
}

async function promptForConfig(): Promise<GeneratorConfig> {
  const templates = await getAvailableTemplates();
  const root = getProjectRoot();

  const day = await input({
    message: 'Which day of Advent of Code?',
    validate: (value: string) => {
      const num = parseInt(value);
      if (!isNaN(num) && num >= 1 && num <= 25) return true;
      return 'Please enter a day between 1 and 25';
    },
  });

  const language = await select({
    message: 'Which template would you like to use?',
    choices: templates.map((t) => ({ value: t, label: t })),
  });

  const year = await input({
    message: 'Which year of Advent of Code?',
    default: new Date().getFullYear().toString(),
  });

  const suggestedPath = getSuggestedSolutionPath(root, language, day);

  const solutionRoot = await input({
    message: 'Where would you like to create the solution scaffold?',
    default: suggestedPath,
  });

  const shouldFetchInput = await confirm({
    message: 'Would you like to fetch the input for this challenge?',
    default: true,
  });

  return {
    day: parseInt(day),
    language,
    year: parseInt(year),
    timestamp: new Date().toISOString(),
    solutionRoot,
    shouldFetchInput,
  };
}

async function main() {
  try {
    console.log('🎄 Advent of Code Solution Generator 🎄\n');
    dotenv.config();

    const config = await promptForConfig();
    await copyTemplateFiles(config);

    if (config.shouldFetchInput) {
      if (!process.env.AOC_SESSION) {
        console.error('Please set AOC_SESSION in .env file to fetch inputs');
        process.exit(1);
      }

      try {
        const input = await fetchInput(config.day, config.year);
        const inputFile = path.join(config.solutionRoot, 'input.txt');
        fs.writeFileSync(inputFile, input.trimEnd());
        console.log(`Successfully wrote input to ${inputFile}`);
      } catch (error: any) {
        console.error('Error fetching input:', error.message);
        process.exit(1);
      }
    }

    console.log('\n✨ All done! Happy coding! ✨');
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
