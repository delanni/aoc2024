import fs from 'fs/promises';
import path from 'path';
import childProcess from 'child_process';
import { confirm } from '@inquirer/prompts';

export interface GeneratorConfig {
  day: number;
  language: string;
  year: number;
  timestamp: string;
  solutionRoot: string;
  downloadInput?: boolean;
  challengeUrl?: string;
}

export const getProjectRoot = (): string =>
  childProcess.execSync('git rev-parse --show-toplevel').toString().trim();

export const getTemplatesDir = (): string => path.join(__dirname, 'templates');

export async function getAvailableTemplates(): Promise<string[]> {
  try {
    return await fs.readdir(getTemplatesDir());
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return [];
  }
}

export async function copyTemplateFiles(config: GeneratorConfig): Promise<void> {
  const templateDir = path.join(getTemplatesDir(), config.language);
  const targetDir = path.join(config.solutionRoot);

  try {
    // Check if directory already exists
    try {
      await fs.access(targetDir);
      // If we get here, the directory exists
      const shouldOverride = await confirm({
        message: `⚠️ Directory ${targetDir} already exists. Do you want to use this folder still?`,
        default: false,
      });

      if (!shouldOverride) {
        console.log('❌ Operation cancelled');
        process.exit(0);
      } else {
        console.log('⚠️ Using existing directory');
        // Create target directory
      }
    } catch {
      // Directory doesn't exist, which is fine
      await fs.mkdir(targetDir, { recursive: true });
    }

    // Read template directory
    const files = await fs.readdir(templateDir);

    // Copy each file from template to target
    for (const file of files) {
      const sourcePath = path.join(templateDir, file);
      const targetPath = path.join(targetDir, file);

      if (file === 'extraData.json') {
        // For extraData.json, we'll write our config data
        await fs.writeFile(
          targetPath,
          JSON.stringify(
            {
              config,
              data: {
                challengeUrl:
                  config.challengeUrl ||
                  `https://adventofcode.com/${config.year}/day/${config.day}`,
              },
            },
            null,
            2,
          ),
        );
      } else {
        // For all other files, just copy them as-is
        await fs.copyFile(sourcePath, targetPath);
      }
    }

    console.log(
      `✨ Created new solution scaffold for Day ${config.day} using ${config.language} template`,
    );
    console.log(`📁 Location: ${targetDir}`);
  } catch (error) {
    console.error('Error copying template files:', error);
    throw error;
  }
}

export function getSuggestedSolutionPath(
  root: string,
  language: string,
  day: number | string,
): string {
  return path.join(root, 'src', language, 'solutions', `day${String(day).padStart(2, '0')}`);
}
