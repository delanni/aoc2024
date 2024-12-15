import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import { select } from '@inquirer/prompts';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in .env file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export interface TTSOptions {
  model?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

const defaultOptions: Required<TTSOptions> = {
  model: 'tts-1',
  voice: 'alloy',
  speed: 1.0,
};

export const voices = [
  { value: 'alloy', name: 'Alloy (neutral)' },
  { value: 'echo', name: 'Echo (male)' },
  { value: 'fable', name: 'Fable (female)' },
  { value: 'onyx', name: 'Onyx (male)' },
  { value: 'nova', name: 'Nova (female)' },
  { value: 'shimmer', name: 'Shimmer (female)' },
] as const;

export type VoiceId = (typeof voices)[number]['value'];

export async function selectVoice(): Promise<VoiceId> {
  return await select({
    message: 'Select a voice for the audio:',
    choices: voices,
  });
}

function stripHtml(html: string, deletePreformattedBlocks = false): string {
  const dom = new JSDOM(html);
  if (deletePreformattedBlocks) {
    const preBlocks = dom.window.document.querySelectorAll('pre');
    preBlocks.forEach((block) => block.remove());
  }
  return dom.window.document.body.textContent || '';
}

export async function textToSpeech(
  text: string,
  outputPath: string,
  options: TTSOptions = {},
): Promise<void> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    // Strip HTML tags, and erase <pre> blocks to clean up the text for speech
    const cleanText = stripHtml(text, true).replace(/\s+/g, ' ');

    const mp3 = await openai.audio.speech.create({
      model: mergedOptions.model,
      voice: mergedOptions.voice,
      input: cleanText,
      speed: mergedOptions.speed,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
    throw new Error('Text-to-speech failed with unknown error');
  }
}
