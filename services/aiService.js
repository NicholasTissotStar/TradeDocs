const PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
};

const getActiveProvider = () => {
  const p = localStorage.getItem('ai-provider');
  if (p && Object.values(PROVIDERS).includes(p)) return p;
  return PROVIDERS.GEMINI;
};

const getKey = (provider) => {
  const key = localStorage.getItem(`ai-keys.${provider}`);
  if (key) return key;
  const token = localStorage.getItem(`ai-tokens.${provider}`);
  if (token) return token;
  if (provider === PROVIDERS.GEMINI) return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  return '';
};

export const getProviderLabel = () => {
  const p = getActiveProvider();
  if (p === PROVIDERS.GEMINI) return 'GEMINI 3 PRO ENGINE ACTIVE';
  if (p === PROVIDERS.OPENAI) return 'OPENAI GPT ENGINE ACTIVE';
  if (p === PROVIDERS.ANTHROPIC) return 'ANTHROPIC CLAUDE ENGINE ACTIVE';
  return 'AI ENGINE ACTIVE';
};

export const setActiveProvider = (provider) => {
  if (Object.values(PROVIDERS).includes(provider)) {
    localStorage.setItem('ai-provider', provider);
  }
};

export const saveApiKey = (provider, key) => {
  if (!Object.values(PROVIDERS).includes(provider)) return;
  if (!key) {
    localStorage.removeItem(`ai-keys.${provider}`);
  } else {
    localStorage.setItem(`ai-keys.${provider}`, key);
  }
};

export const listProviders = () => [
  { id: PROVIDERS.GEMINI, name: 'Google Gemini' },
  { id: PROVIDERS.OPENAI, name: 'OpenAI' },
  { id: PROVIDERS.ANTHROPIC, name: 'Anthropic' },
];

export const generateDocumentStructure = async (params) => {
  const provider = getActiveProvider();
  if (provider === PROVIDERS.GEMINI) {
    const mod = await import('./geminiService.js');
    return mod.generateDocumentStructure(params);
  }
  if (provider === PROVIDERS.OPENAI) {
    const mod = await import('./openAIService.js');
    return mod.generateDocumentStructureWithOpenAI(params, getKey(PROVIDERS.OPENAI));
  }
  if (provider === PROVIDERS.ANTHROPIC) {
    const mod = await import('./providers/anthropicService.js').catch(() => null);
    if (mod && mod.generateDocumentStructureWithAnthropic) {
      return mod.generateDocumentStructureWithAnthropic(params, getKey(PROVIDERS.ANTHROPIC));
    }
  }
  const mod = await import('./geminiService.js');
  return mod.generateDocumentStructure(params);
};

export const generateFullDocumentContent = async (params, structures, progressCallback, onToken) => {
  const provider = getActiveProvider();
  if (provider === PROVIDERS.GEMINI) {
    const mod = await import('./geminiService.js');
    return mod.generateFullDocumentContent(params, structures, progressCallback, onToken);
  }
  if (provider === PROVIDERS.OPENAI) {
    const mod = await import('./openAIService.js');
    return mod.generateFullDocumentContentWithOpenAI(params, structures, getKey(PROVIDERS.OPENAI), progressCallback, onToken);
  }
  if (provider === PROVIDERS.ANTHROPIC) {
    const mod = await import('./providers/anthropicService.js').catch(() => null);
    if (mod && mod.generateFullDocumentContentWithAnthropic) {
      return mod.generateFullDocumentContentWithAnthropic(params, structures, getKey(PROVIDERS.ANTHROPIC), progressCallback, onToken);
    }
  }
  const mod = await import('./geminiService.js');
  return mod.generateFullDocumentContent(params, structures, progressCallback, onToken);
};

export const PROVIDER_IDS = PROVIDERS;

