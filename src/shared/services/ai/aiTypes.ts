export type AiProviderType = 
  | 'native-bridge' 
  | 'chrome-built-in' 
  | 'local-endpoint' 
  | 'server-fallback' 
  | 'offline-fallback';

export interface AiConnectionStatus {
  provider: AiProviderType;
  statusText: 'Linked Node' | 'Unavailable' | 'Endpoint Failed' | 'Browser AI Available' | 'Server Fallback' | 'Offline Rules Active';
  isAvailable: boolean;
  details?: string;
}

export interface AiPromptOptions {
  temperature?: number;
  maxTokens?: number;
}
