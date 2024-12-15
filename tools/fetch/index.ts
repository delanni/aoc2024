import { input, confirm } from '@inquirer/prompts';
import { fetchInput, fetchTasks } from '../initialize_challenge/fetchers';
import { translateText } from './translator';
import { textToSpeech, selectVoice } from './tts';
import * as fs from 'fs';
import * as path from 'path';

interface TaskContent {
  text: string | null;
  language: string;
}

interface DaySetup {
  dayNum: number;
  paddedDay: string;
  solutionDir: string;
  paths: {
    input: string;
    taskMd: string;
    taskHtml: string;
  };
}

async function main() {
  try {
    const dayNum = await promptForDay();
    const setup = await setupDay(dayNum);

    // Fetch tasks and input
    const [task1Text, task2Text] = await fetchTasks(dayNum, 2024);
    const inputData = await fetchInput(dayNum, 2024);

    // Write original tasks
    await writeOriginalTasks(setup, task1Text, task2Text);

    // Initialize task content objects
    let task1: TaskContent = { text: task1Text, language: 'English' };
    let task2: TaskContent = { text: task2Text, language: 'English' };

    // Handle translation if requested
    [task1, task2] = await handleTranslation(setup, task1, task2);

    // Handle audio generation if requested
    await handleAudioGeneration(setup, task1, task2);

    // Write input file
    fs.writeFileSync(setup.paths.input, inputData);

    // Final output
    console.log(`Successfully fetched day ${dayNum} tasks and input!`);
    console.log(`Tasks saved in: ${setup.paths.taskMd}`);
    console.log(`HTML version saved in: ${setup.paths.taskHtml}`);
    console.log(`Input saved in: ${setup.paths.input}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

async function promptForDay(): Promise<number> {
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
  return parseInt(day);
}

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

function loadTemplate(): string {
  const templatePath = path.join(__dirname, 'template.html');
  return fs.readFileSync(templatePath, 'utf-8');
}

function generateTaskHtml(template: string, part1: string | null, part2: string | null): string {
  return template
    .replace('{{PART1}}', part1 || 'Part 1 not available yet')
    .replace('{{PART2}}', part2 || 'Part 2 not available yet');
}

async function setupDay(dayNum: number): Promise<DaySetup> {
  const paddedDay = dayNum.toString().padStart(2, '0');
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

  return {
    dayNum,
    paddedDay,
    solutionDir,
    paths: {
      input: path.join(solutionDir, 'input.txt'),
      taskMd: path.join(solutionDir, 'task.md'),
      taskHtml: path.join(solutionDir, 'task.html'),
    },
  };
}

async function handleTranslation(
  setup: DaySetup,
  task1: TaskContent,
  task2: TaskContent,
): Promise<[TaskContent, TaskContent]> {
  const shouldTranslate = await confirm({
    message: 'Would you like to translate the tasks?',
    default: false,
  });

  if (!shouldTranslate) {
    return [task1, task2];
  }

  const targetLanguage = await input({
    message: 'Enter target language (e.g., "Spanish", "French"):',
    default: 'Hungarian',
  });

  const languageSuffix = targetLanguage.toLowerCase();
  const translatedMdPath = path.join(setup.solutionDir, `task.${languageSuffix}.md`);
  const translatedHtmlPath = path.join(setup.solutionDir, `task.${languageSuffix}.html`);

  console.log('Translating tasks...');
  let translatedTask1;
  let translatedTask2;
  if (!fs.existsSync(translatedHtmlPath) || (await promptDelete(translatedHtmlPath))) {
    translatedTask1 = task1.text ? await translateText(task1.text, targetLanguage) : null;
    translatedTask2 = task2.text ? await translateText(task2.text, targetLanguage) : null;

    // Write translated files
    fs.writeFileSync(
      translatedMdPath,
      [translatedTask1, translatedTask2].join('\n------<!--split-->\n'),
    );
    const template = loadTemplate();
    const translatedHtmlContent = generateTaskHtml(template, translatedTask1, translatedTask2);
    fs.writeFileSync(translatedHtmlPath, translatedHtmlContent);
    console.log('Translation complete!');
    console.log(`Translated markdown saved in: ${translatedMdPath}`);
    console.log(`Translated HTML saved in: ${translatedHtmlPath}`);
  } else {
    [translatedTask1, translatedTask2] = fs
      .readFileSync(translatedMdPath)
      .toString()
      .split('\n------<!--split-->\n');
    console.log(`Translated files were already present`);
  }

  return [
    { text: translatedTask1, language: targetLanguage },
    { text: translatedTask2, language: targetLanguage },
  ];
}

async function handleAudioGeneration(
  setup: DaySetup,
  task1: TaskContent,
  task2: TaskContent,
): Promise<void> {
  const shouldGenerateAudio = await confirm({
    message: 'Would you like to generate audio versions of the tasks?',
    default: false,
  });

  if (!shouldGenerateAudio) {
    return;
  }

  const voice = await selectVoice();
  console.log('Generating audio files...');

  if (task1.text) {
    const task1AudioPath = path.join(setup.solutionDir, 'task1.mp3');
    if (!fs.existsSync(task1AudioPath)) {
      await textToSpeech(task1.text, task1AudioPath, { voice });
      console.log(`Part 1 audio saved to: ${task1AudioPath}`);
    } else {
      console.log(`Part 1 mp3 already present, skipping. (${task1AudioPath})`);
    }
  }

  if (task2.text) {
    const task2AudioPath = path.join(setup.solutionDir, 'task2.mp3');
    if (!fs.existsSync(task2AudioPath)) {
      await textToSpeech(task2.text, task2AudioPath, { voice });
      console.log(`Part 2 audio saved to: ${task2AudioPath}`);
    } else {
      console.log(`Part 2 mp3 already present, skipping. (${task2AudioPath})`);
    }
  }

  console.log(`Audio generation complete! (Language: ${task1.language})`);
}

async function writeOriginalTasks(
  setup: DaySetup,
  task1: string | null,
  task2: string | null,
): Promise<void> {
  fs.mkdirSync(setup.solutionDir, { recursive: true });

  // Write markdown version
  fs.writeFileSync(setup.paths.taskMd, [task1, task2].join('\n------\n'));

  // Write HTML version
  const template = loadTemplate();
  const htmlContent = generateTaskHtml(template, task1, task2);
  fs.writeFileSync(setup.paths.taskHtml, htmlContent);
}

function promptDelete(path: string): Promise<boolean> {
  return confirm({
    message: `File already exists at ${path}. Overwrite?`,
    default: false,
  });
}

main();
