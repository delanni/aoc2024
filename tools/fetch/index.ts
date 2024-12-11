import { input } from '@inquirer/prompts';
import { fetchInput, fetchTasks } from '../initialize_challenge/fetchers';
import * as fs from 'fs';
import * as path from 'path';

async function getOrPromptForDirectory(basePath: string, description: string): Promise<string> {
  if (fs.existsSync(basePath)) {
    return basePath;
  }

  const shouldCreate = await input({
    message: `${description} directory (${basePath}) doesn't exist. Enter path to use instead (or press enter to create the default):`,
    default: basePath,
  });

  return shouldCreate;
}

async function main() {
  const day =
    process.argv[2] ??
    (await input({
      message: 'Which day of Advent of Code?',
      validate: (value: string) => {
        const num = parseInt(value);
        if (!isNaN(num) && num >= 1 && num <= 25) return true;
        return 'Please enter a day between 1 and 25';
      },
    }));

  const year = 2024;
  const dayNum = parseInt(day);
  const paddedDay = dayNum.toString().padStart(2, '0');

  try {
    const [task1, task2] = await fetchTasks(dayNum, year);
    const inputData = await fetchInput(dayNum, year);

    // Get or prompt for directories
    const defaultSolutionDir = path.join(
      process.cwd(),
      'src',
      'typescript',
      'solutions',
      `day${paddedDay}`,
    );
    const solutionDir = fs.existsSync(defaultSolutionDir)
      ? defaultSolutionDir
      : await getOrPromptForDirectory(defaultSolutionDir, 'Tasks');

    const defaultInputPath = path.join(solutionDir, 'input.txt');
    const defaultTasksPath = path.join(solutionDir, 'task.md');

    // Create directories
    fs.mkdirSync(solutionDir, { recursive: true });

    // Write tasks
    fs.writeFileSync(defaultTasksPath, `${task1}\n------\n${task2}`);

    // Write input
    fs.writeFileSync(defaultInputPath, inputData);

    console.log(`Successfully fetched day ${dayNum} tasks and input!`);
    console.log(`Tasks saved in: ${defaultTasksPath}`);
    console.log(`Input saved in: ${defaultInputPath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

main();
