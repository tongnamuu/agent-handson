import process from "node:process";

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

const ollamaHost = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const model = process.env.OLLAMA_MODEL ?? "qwen2.5";
const userPrompt = process.argv.slice(2).join(" ") || "Who are you?";
const userMessage: OllamaMessage = {
  role: "user",
  content: userPrompt,
};
const messages: OllamaMessage[] = [userMessage];

async function callOllama(): Promise<OllamaMessage> {
  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
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

try {
  const message = await callOllama();
  console.log(message.content);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to call Ollama: ${message}`);
  process.exitCode = 1;
}
