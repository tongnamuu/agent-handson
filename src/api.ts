import process from "node:process";

import type { ToolCall, ToolSchema } from "./tools";

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_name?: string;
  tool_calls?: ToolCall[];
}

interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

const ollamaHost = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const model = process.env.OLLAMA_MODEL ?? "qwen2.5";

export async function chatLLM(
  messages: OllamaMessage[],
  tools: ToolSchema[] = [],
): Promise<OllamaMessage> {
  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      stream: false,
      options: {
        temperature: 0,
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as OllamaChatResponse;
  return result.message;
}
