export type RewriteStyle = 'pirate' | 'haiku' | 'formal';

export interface RewriteRequest {
  text: string;
  style?: RewriteStyle;
}

export interface RewriteResponse {
  original: string;
  transformed: string;
}

export interface LLMAdapter {
  rewriteText(text: string, style: RewriteStyle): Promise<string>;
} 