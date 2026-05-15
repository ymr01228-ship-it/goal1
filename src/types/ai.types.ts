export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  createdAt: string;
  title: string;
}

export const AI_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
};
