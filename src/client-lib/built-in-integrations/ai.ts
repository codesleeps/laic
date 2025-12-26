import { type JSONSchema7 } from "json-schema";

type ReasoningEffort = "low" | "medium" | "high";
type ModelProvider = "openai" | "google" | "openrouter";

/**
 * Generate text using AI
 * 
 * @param prompt - The prompt to generate text from
 * @param reasoningEffort - The reasoning effort to use (default: 'low')
 *   'low' - Faster, uses lightweight models (GPT-4o-mini, Gemini 2.0 Flash)
 *   'medium' - Balanced (GPT-4o, Gemini 2.5 Flash)
 *   'high' - Most capable (o1-preview, Gemini 2.5 Pro, Claude Sonnet 4)
 * @param modelProvider - The AI provider to use (default: 'google')
 *   'openai' - OpenAI models
 *   'google' - Google Gemini models
 *   'openrouter' - OpenRouter (access to multiple providers)
 */
export async function generateText(
  prompt: string,
  reasoningEffort: ReasoningEffort = "low",
  modelProvider: ModelProvider = "google",
): Promise<string> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "text",
      prompt,
      reasoningEffort,
      modelProvider,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate text");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate a structured object using AI
 *
 * @param prompt - The prompt describing what to generate
 * @param jsonSchema - The JSON schema defining the output structure
 * @param reasoningEffort - The reasoning effort to use (default: 'low')
 *   'low' - Faster, uses lightweight models
 *   'medium' - Balanced speed and accuracy
 *   'high' - Most capable, use for complex analysis
 * @param modelProvider - The AI provider to use (default: 'google')
 *   'openai' - OpenAI models
 *   'google' - Google Gemini models  
 *   'openrouter' - OpenRouter (access to multiple providers)
 *
 * @returns The generated object matching the schema
 */
export async function generateObject<T>(
  prompt: string,
  jsonSchema: JSONSchema7,
  reasoningEffort: ReasoningEffort = "low",
  modelProvider: ModelProvider = "google",
): Promise<T> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "object",
      prompt,
      jsonSchema,
      reasoningEffort,
      modelProvider,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate object");
  }

  const result = await response.json();
  return result.data as T;
}

/**
 * Available AI providers and their models
 */
export const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: {
      low: "GPT-4o Mini",
      medium: "GPT-4o",
      high: "o1-preview",
    },
  },
  google: {
    name: "Google Gemini",
    models: {
      low: "Gemini 2.0 Flash",
      medium: "Gemini 2.5 Flash",
      high: "Gemini 2.5 Pro",
    },
  },
  openrouter: {
    name: "OpenRouter",
    models: {
      low: "Gemini 2.0 Flash (Free)",
      medium: "Gemini 2.5 Flash",
      high: "Claude Sonnet 4",
    },
  },
} as const;
