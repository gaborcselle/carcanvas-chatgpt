interface OpenAIGlobal {
  [key: string]: unknown;
}

declare global {
  interface Window {
    openai?: OpenAIGlobal;
  }
}

export {};