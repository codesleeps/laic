"use server";

import { NextRequest, NextResponse } from "next/server";

type ReasoningEffort = "low" | "medium" | "high";
type ModelProvider = "openai" | "google" | "openrouter";

interface GenerateTextRequest {
  prompt: string;
  enableWebSearch?: boolean;
  enableDeepResearch?: boolean;
  reasoningEffort?: ReasoningEffort;
  modelProvider?: ModelProvider;
}

interface GenerateObjectRequest {
  prompt: string;
  jsonSchema: object;
  reasoningEffort?: ReasoningEffort;
  modelProvider?: ModelProvider;
}

// Model mapping based on reasoning effort
const MODELS = {
  openai: {
    low: "gpt-4o-mini",
    medium: "gpt-4o",
    high: "o1-preview",
  },
  google: {
    low: "gemini-3-flash-preview",           // Updated from gemini-2.0-flash-exp
    medium: "gemini-2.5-flash-preview-05-20", // Keep existing
    high: "gemini-2.5-pro-preview-06-05",     // Keep existing
  },
  openrouter: {
    low: "z-ai/glm-4.7",                      // Updated from google/gemini-2.0-flash-exp:free
    medium: "z-ai/glm-4-32b",                 // Updated from google/gemini-2.5-flash-preview-05-20
    high: "deepseek/deepseek-v3.2-speciale",  // Updated from anthropic/claude-sonnet-4
  },
};

function getApiKey(provider: ModelProvider): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.API_KEY_OPENAI;
    case "google":
      return process.env.API_KEY_GEMINIAI;
    case "openrouter":
      return process.env.API_KEY_OPENROUTER;
  }
}

async function generateWithOpenAI(
  prompt: string,
  model: string,
  jsonSchema?: object
): Promise<string> {
  const apiKey = getApiKey("openai");
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const messages = [{ role: "user", content: prompt }];
  
  const body: Record<string, unknown> = {
    model,
    messages,
  };

  if (jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "response",
        schema: jsonSchema,
        strict: true,
      },
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function generateWithGemini(
  prompt: string,
  model: string,
  jsonSchema?: object
): Promise<string> {
  const apiKey = getApiKey("google");
  if (!apiKey) {
    throw new Error("Google Gemini API key not configured");
  }

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (jsonSchema) {
    body.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateWithOpenRouter(
  prompt: string,
  model: string,
  jsonSchema?: object
): Promise<string> {
  const apiKey = getApiKey("openrouter");
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const messages = [{ role: "user", content: prompt }];
  
  const body: Record<string, unknown> = {
    model,
    messages,
  };

  if (jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "response",
        schema: jsonSchema,
        strict: true,
      },
    };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "LeanBuild AI",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generate(
  prompt: string,
  provider: ModelProvider,
  reasoningEffort: ReasoningEffort,
  jsonSchema?: object
): Promise<string> {
  const model = MODELS[provider][reasoningEffort];

  switch (provider) {
    case "openai":
      return generateWithOpenAI(prompt, model, jsonSchema);
    case "google":
      return generateWithGemini(prompt, model, jsonSchema);
    case "openrouter":
      return generateWithOpenRouter(prompt, model, jsonSchema);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "text") {
      const { prompt, reasoningEffort = "low", modelProvider = "google" } = body as GenerateTextRequest & { type: string };
      
      const result = await generate(prompt, modelProvider, reasoningEffort);
      
      return NextResponse.json({ success: true, data: result });
    } else if (type === "object") {
      const { prompt, jsonSchema, reasoningEffort = "low", modelProvider = "google" } = body as GenerateObjectRequest & { type: string };
      
      const result = await generate(prompt, modelProvider, reasoningEffort, jsonSchema);
      
      // Parse the JSON response
      try {
        const parsed = JSON.parse(result);
        return NextResponse.json({ success: true, data: parsed });
      } catch {
        return NextResponse.json({ success: true, data: result });
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'text' or 'object'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
