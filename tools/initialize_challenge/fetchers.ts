import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

export async function fetchInput(day: number, year: number): Promise<string> {
  const { default: fetch } = await import('node-fetch');
  dotenv.config();

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

export async function fetchTasks(day: number, year: number): Promise<Array<string | null>> {
  const { default: fetch } = await import('node-fetch');
  dotenv.config();

  const response = await fetch(`https://adventofcode.com/${year}/day/${day}`, {
    headers: {
      Cookie: `session=${process.env.AOC_SESSION}`,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch task: ${response.statusText}`);
    return [null, null];
  }

  try {
    const textHtml = await response.text();

    const dom = new JSDOM(textHtml);
    const taskArticles = dom?.window?.document?.querySelectorAll('article.day-desc');

    if (!taskArticles || taskArticles.length === 0) {
      console.warn('No tasks could be found in the DOM with $article.day-desc');
      return [null, null];
    } else {
      const articles = Array.from(taskArticles);
      return [articles[0]?.innerHTML?.trim() || null, articles[1]?.innerHTML?.trim() || null];
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching task:', error.message);
    }
    return [null, null];
  }
}

export function hasConfig() {
  dotenv.config();
  if (process.env.AOC_SESSION) {
    return true;
  } else {
    return false;
  }
}
