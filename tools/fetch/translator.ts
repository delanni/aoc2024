import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in .env file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export interface TranslationOptions {
  systemPrompt?: string;
  temperature?: number;
  model?: string;
}

const defaultOptions: Required<TranslationOptions> = {
  systemPrompt:
    'You are a helpful translator. Translate the text while preserving all HTML formatting and markdown syntax. Keep code blocks and examples exactly as they are, only translate the natural language text.',
  temperature: 0.3,
  model: 'gpt-4o-mini',
};

export async function translateText(
  text: string,
  targetLanguage: string,
  options: TranslationOptions = {},
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const response = await openai.chat.completions.create({
      model: mergedOptions.model,
      temperature: mergedOptions.temperature,
      messages: [
        {
          role: 'system',
          content: mergedOptions.systemPrompt,
        },
        {
          role: 'user',
          content: `Translate the following text to ${targetLanguage}. Preserve all HTML tags and formatting:

${text}`,
        },
      ],
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('No translation received from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Translation failed: ${error.message}`);
    }
    throw new Error('Translation failed with unknown error');
  }
}
