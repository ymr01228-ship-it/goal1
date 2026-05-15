import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProvider, AIMessage } from '@/types/ai.types';
import { generateId } from '@/lib/utils';

interface AIStore {
  provider: AIProvider;
  model: string;
  apiKey: string;
  conversations: AIMessage[];
  isConfigured: boolean;
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (key: string) => void;
  addMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
  clearHistory: () => void;
  getIsConfigured: () => boolean;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
      conversations: [],
      isConfigured: false,

      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      setApiKey: (key) => set({ apiKey: key, isConfigured: key.length > 0 }),

      addMessage: (role, content) => {
        const message: AIMessage = {
          id: generateId(),
          role,
          content,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          conversations: [...state.conversations, message],
        }));
      },

      clearHistory: () => set({ conversations: [] }),

      getIsConfigured: () => {
        return get().apiKey.length > 0;
      },
    }),
    {
      name: 'focusos-ai',
    }
  )
);
