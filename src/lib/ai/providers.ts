// AI Provider configuration for FocusOS
// Uses user's own API keys - stored locally only

import type { AIProvider } from '@/types/ai.types';

interface ProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
  headerKey: string;
}

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    headerKey: 'Authorization',
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    headerKey: 'x-api-key',
  },
  google: {
    name: 'Google AI',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    headerKey: 'x-goog-api-key',
  },
};

export function getProviderConfig(provider: AIProvider): ProviderConfig {
  return PROVIDER_CONFIGS[provider];
}

export function buildSystemPrompt(
  goal: string | null,
  language: string,
  context: {
    habitCompliance?: number;
    detoxScore?: number;
    daysCommitted?: number;
    streakInfo?: string;
  }
): string {
  const langMap: Record<string, string> = {
    en: 'English',
    ar: 'Arabic',
    de: 'German',
  };

  return `You are FocusOS AI Coach — a firm but empathetic productivity coach. 
You help users achieve their single goal through behavioral change, habit formation, and focus.

User's Single Goal: ${goal || 'Not set yet'}
Language: Respond in ${langMap[language] || 'English'}
Days Committed: ${context.daysCommitted || 0}
Habit Compliance: ${context.habitCompliance || 0}%
Detox Score: ${context.detoxScore || 100}
${context.streakInfo ? `Streak Info: ${context.streakInfo}` : ''}

Rules:
1. Always relate advice back to the user's single goal
2. Be honest and direct — don't sugarcoat poor performance
3. Celebrate genuine progress with enthusiasm
4. Suggest specific, actionable next steps
5. Address root causes of distraction, not just symptoms
6. Use evidence from user's data to personalize advice`;
}
