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

export async function fetchTask(day: number, year: number): Promise<string[] | null> {
  const { default: fetch } = await import('node-fetch');
  dotenv.config();

  const response = await fetch(`https://adventofcode.com/${year}/day/${day}`, {
    headers: {
      Cookie: `session=${process.env.AOC_SESSION}`,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch task: ${response.statusText}`);
    return null;
  }

  try {
    const textHtml = await response.text();

    const dom = new JSDOM(textHtml);
    const taskArticles = dom?.window?.document?.querySelectorAll('article.day-desc');

    if (taskArticles && taskArticles.length > 0) {
      return Array.from(taskArticles)
        .map((taskArticle) => taskArticle.textContent?.trim())
        .filter<string>(isString);
    } else {
      console.error('Cannot find articles in dom.');
      return null;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching task:', error.message);
    }
    return null;
  }
}

function isString(t: any): t is string {
  return typeof t === 'string';
}
