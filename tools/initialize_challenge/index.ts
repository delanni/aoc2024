import { input, select } from '@inquirer/prompts';
import {
  GeneratorConfig,
  getAvailableTemplates,
  getProjectRoot,
  copyTemplateFiles,
  getSuggestedSolutionPath,
} from './lib';

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

  return {
    day: parseInt(day),
    language,
    year: parseInt(year),
    timestamp: new Date().toISOString(),
    solutionRoot,
  };
}

async function main() {
  try {
    console.log('🎄 Advent of Code Solution Generator 🎄\n');

    const config = await promptForConfig();
    await copyTemplateFiles(config);

    console.log('\n🚀 Ready to solve! Happy coding! 🎅');
  } catch (error) {
    console.error('Failed to generate solution scaffold:', error);
    process.exit(1);
  }
}

main();
