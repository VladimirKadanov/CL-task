import { LLMAdapter, RewriteStyle } from '@/types';
import OpenAI from 'openai';

export class MockLLMAdapter implements LLMAdapter {
  async rewriteText(text: string, style: RewriteStyle): Promise<string> {
    switch (style) {
      case 'pirate':
        return `[*PIRATE*] ${text} [*/PIRATE*]`;
      case 'haiku':
        return `[*HAIKU*]\n${text}\n[*/HAIKU*]`;
      case 'formal':
        return `[*FORMAL*] ${text} [*/FORMAL*]`;
      default:
        throw new Error(`Unknown style: ${style}`);
    }
  }
}

export class OpenAIAdapter implements LLMAdapter {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.LLM_BASE_URL,
    });
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS || '1000', 10);
    this.temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.7');
  }

  private getStylePrompt(style: RewriteStyle): string {
    switch (style) {
      case 'pirate':
        return 'Rewrite the following text in a pirate style, using pirate vocabulary and expressions. Keep the original meaning but make it sound like a pirate would say it:';
      case 'haiku':
        return 'Convert the following text into a haiku (a 3-line poem with 5-7-5 syllable pattern). Maintain the original meaning while following the haiku structure:';
      case 'formal':
        return 'Rewrite the following text in a formal, professional style. Use proper grammar, sophisticated vocabulary, and maintain a respectful tone:';
      default:
        throw new Error(`Unknown style: ${style}`);
    }
  }

  async rewriteText(text: string, style: RewriteStyle): Promise<string> {
    try {
      const prompt = this.getStylePrompt(style);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a text transformation assistant. Your task is to rewrite text according to specific styles while maintaining the original meaning.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${text}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const transformedText = completion.choices[0]?.message?.content;
      if (!transformedText) {
        throw new Error('No response from OpenAI');
      }

      return transformedText;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to transform text using OpenAI');
    }
  }
}

export function createLLMAdapter(): LLMAdapter {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return new MockLLMAdapter();
  }
  return new OpenAIAdapter(apiKey);
} 