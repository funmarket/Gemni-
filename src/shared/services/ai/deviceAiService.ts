import { AiProviderType, AiConnectionStatus } from './aiTypes';
import { chromeBuiltInAiProvider } from './chromeBuiltInAiProvider';
import { localEndpointAiProvider } from './localEndpointAiProvider';
import { serverAiProvider } from './serverAiProvider';

export const deviceAiService = {
  detectAvailableProvider: async (config: {
    enabled: boolean;
    endpoint: string;
  }): Promise<AiConnectionStatus> => {
    // 1. Native bridge check
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.VibeQuestNativeBridge?.ai) {
      return {
        provider: 'native-bridge',
        statusText: 'Using Native Device AI',
        isAvailable: true,
        details: 'Native application AI interface connected'
      };
    }

    // 2. Local endpoint check (if enabled and configured)
    if (config.enabled && config.endpoint) {
      const test = await localEndpointAiProvider.testConnection(config.endpoint);
      if (test.success) {
        return {
          provider: 'local-endpoint',
          statusText: 'Linked Node',
          isAvailable: true,
          details: test.message
        };
      } else {
        return {
          provider: 'local-endpoint',
          statusText: 'Endpoint Failed',
          isAvailable: false,
          details: test.message
        };
      }
    }

    // 3. Chrome built-in AI check
    const hasChromeBuiltIn = await chromeBuiltInAiProvider.isSupported();
    if (hasChromeBuiltIn) {
      return {
        provider: 'chrome-built-in',
        statusText: 'Browser AI Available',
        isAvailable: true,
        details: 'Chrome Gemini Nano (Prompt API) ready'
      };
    }

    // 4. Server AI check
    const hasServerAi = await serverAiProvider.isSupported();
    if (hasServerAi) {
      return {
        provider: 'server-fallback',
        statusText: 'Server Fallback',
        isAvailable: true,
        details: 'Cloud API models ready'
      };
    }

    // 5. Offline fallback
    return {
      provider: 'offline-fallback',
      statusText: 'Offline Rules Active',
      isAvailable: true,
      details: 'Local algorithmic matcher enabled'
    };
  },

  generateVibeSuggestion: async (
    prompt: string,
    config: { enabled: boolean; endpoint: string },
    privacyConfig?: { allowPreciseLocation?: boolean; coarseLocation?: string }
  ): Promise<string> => {
    // Sanitize prompt for privacy - remove any high precision coordinates
    let sanitizedPrompt = prompt;
    if (!privacyConfig?.allowPreciseLocation) {
      // Remove any precise coordinates like (lat: 36.806543, lng: 10.181512)
      sanitizedPrompt = prompt.replace(/-?\d+\.\d{5,}/g, '[Coarse Area]');
      if (privacyConfig?.coarseLocation) {
        sanitizedPrompt += `\n(Approximate Location: ${privacyConfig.coarseLocation})`;
      }
    }

    const connection = await deviceAiService.detectAvailableProvider(config);

    try {
      switch (connection.provider) {
        case 'native-bridge':
          const win = window as any;
          return await win.VibeQuestNativeBridge.ai.generate(sanitizedPrompt);

        case 'local-endpoint':
          return await localEndpointAiProvider.generateText(config.endpoint, sanitizedPrompt);

        case 'chrome-built-in':
          return await chromeBuiltInAiProvider.generateText(sanitizedPrompt);

        case 'server-fallback':
          return await serverAiProvider.generateText(sanitizedPrompt);

        case 'offline-fallback':
        default:
          return getOfflineFallbackSuggestion(sanitizedPrompt);
      }
    } catch (err) {
      console.warn(`AI Provider ${connection.provider} failed. Running offline fallback.`, err);
      return getOfflineFallbackSuggestion(sanitizedPrompt);
    }
  }
};

/**
 * Poetic rule-based local generator for high-reliability offline use
 */
function getOfflineFallbackSuggestion(prompt: string): string {
  const prompts = prompt.toLowerCase();
  
  if (prompts.includes('coffee') || prompts.includes('cafe')) {
    return "💡 Offline Suggestion: Visit the nearest local café courtyard, feel the warm aroma, and chat with a fellow traveler about their journey.";
  }
  if (prompts.includes('art') || prompts.includes('museum') || prompts.includes('creative')) {
    return "💡 Offline Suggestion: Walk through an alleyway rich with street art or local murals. Art is the pulse of the city; observe how colors shift in twilight.";
  }
  if (prompts.includes('park') || prompts.includes('nature') || prompts.includes('view')) {
    return "💡 Offline Suggestion: Seek a green hillside or a nearby public garden. Sit silently under the canopy for five minutes to recalibrate your digital vibe.";
  }

  return "💡 Offline Suggestion: Explore a nearby street you've never walked before. The best coordinates are discovered when you allow yourself to drift without maps.";
}
