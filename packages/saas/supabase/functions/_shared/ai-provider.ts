// Unified chat-completion call across BYOK providers. OpenAI, OpenRouter,
// Groq, Gemini (via its OpenAI-compatibility endpoint), Perplexity, and any self-hosted/
// custom server (Ollama, LM Studio, vLLM, ...) all speak the same
// OpenAI-shaped /chat/completions request - only the base URL and model
// name differ, so they share one request path. Anthropic's Messages API is
// a genuinely different shape (system is a top-level field, not a message;
// no response_format; content comes back as an array of blocks) and gets
// its own path.
//
// packages/audit-worker/src/ai-provider.ts is a Node copy of this file - keep them in step.

export type AIProvider =
  | 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'gemini' | 'perplexity'
  | 'deepseek' | 'together' | 'fireworks' | 'mistral' | 'cerebras'
  | 'custom';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

// Sensible defaults so a BYOK user only has to supply a key for the four
// hosted providers - 'custom' always requires baseUrl+model since there's
// no way to guess a self-hosted server's address or which model it's
// serving.
// OpenRouter is the primary bridge. Its default is openrouter/free, OpenRouter's own router over
// whichever free models are live - pinning one free model (deepseek/deepseek-r1:free) is how this
// broke: it was withdrawn, and every OpenRouter key saved without a model override then failed
// verification.
// Cheap hosted providers speak the same OpenAI-shaped API. A default model is set only where
// the provider keeps a stable alias (deepseek-chat, mistral-small-latest); Together, Fireworks
// and Cerebras rename their catalogues often, so the user names the model.
const PROVIDER_DEFAULTS: Record<Exclude<AIProvider, 'custom'>, { baseUrl: string; model?: string }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-5' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: 'openrouter/free' },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' },
  perplexity: { baseUrl: 'https://api.perplexity.ai', model: 'sonar' },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  mistral: { baseUrl: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
  together: { baseUrl: 'https://api.together.xyz/v1' },
  fireworks: { baseUrl: 'https://api.fireworks.ai/inference/v1' },
  cerebras: { baseUrl: 'https://api.cerebras.ai/v1' },
};

// OpenAI's reasoning families (GPT-5.x, o-series) reject `temperature` at any value and
// take `max_completion_tokens` instead of `max_tokens`. Users pick their own model, so
// this is decided per request rather than per provider.
function isOpenAIReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/.test(model);
}

export function resolveProviderSettings(config: AIProviderConfig): { baseUrl: string; model: string } {
  if (config.provider === 'custom') {
    if (!config.baseUrl || !config.model) {
      throw new Error('Custom provider requires both a base URL and a model name');
    }
    return { baseUrl: config.baseUrl, model: config.model };
  }
  const defaults = PROVIDER_DEFAULTS[config.provider];
  const model = config.model || defaults.model;
  if (!model) throw new Error(`${config.provider} needs a model name`);
  return {
    baseUrl: config.baseUrl || defaults.baseUrl,
    model,
  };
}

// Returns the raw text content from the model. Callers that need structured
// JSON pass jsonMode and are responsible for JSON.parse-ing the result
// themselves (Anthropic has no native response_format, so this can't
// guarantee valid JSON the way OpenAI's json_object mode can - callers
// should prompt for JSON explicitly regardless of jsonMode).
export async function callChatCompletion(
  config: AIProviderConfig,
  systemPrompt: string,
  userPrompt: string,
  options: { jsonMode?: boolean; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const { baseUrl, model } = resolveProviderSettings(config);
  const maxTokens = options.maxTokens ?? 16000;
  const temperature = options.temperature ?? 0.3;

  if (config.provider === 'anthropic') {
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error (${response.status}): ${await response.text()}`);
    }

    const result = await response.json();
    const text = result.content?.find((block: { type: string }) => block.type === 'text')?.text;
    if (!text) throw new Error('No text content in Anthropic response');
    return text;
  }

  // OpenAI-compatible path: openai, openrouter, groq, gemini, perplexity, custom.
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
  // OpenRouter attributes usage to the calling app in its dashboard if these
  // are set - harmless to omit for other providers, so only add for that one.
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://rankcli.dev';
    headers['X-Title'] = 'RankCLI';
  }

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };
  if (config.provider === 'openai') {
    // Every current OpenAI chat model accepts max_completion_tokens; max_tokens is legacy.
    body.max_completion_tokens = maxTokens;
    if (!isOpenAIReasoningModel(model)) body.temperature = temperature;
  } else {
    body.max_tokens = maxTokens;
    body.temperature = temperature;
  }
  // json_object response_format is an OpenAI-specific extension - not every
  // OpenAI-compatible server implements it (many local/custom servers
  // don't), so only request it for providers confirmed to support it.
  if (options.jsonMode && ['openai', 'openrouter', 'groq', 'deepseek', 'mistral'].includes(config.provider)) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${config.provider} API error (${response.status}): ${await response.text()}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error(`No response content from ${config.provider}`);
  return content;
}

// Cheap, fast call used to validate a key/config before saving it, so the
// settings UI can say "verified" rather than only finding out a key is bad
// the next time an auto-fix PR silently fails hours later.
export async function testProviderConnection(config: AIProviderConfig): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    // 256, not 5: a reasoning model can spend a tiny budget thinking and return no text,
    // which would fail a perfectly good key.
    await callChatCompletion(config, 'Reply with exactly: OK', 'OK', { maxTokens: 256, temperature: 0 });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
